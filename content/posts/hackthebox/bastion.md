---
title: "Bastion - HackTheBox"
date: 2019-09-06T15:42:05+02:00
tags:
    - "CTF"
    - "HackTheBox"
    - "Windows"
    - "Cracking"
---
![Description](/images/hackthebox/bastion/info.png)
Bastion is a simple Windows machine that involves Windows backups and bad tools
configurations.

As always, let's run a port scan using our trusty [nmap](https://nmap.org/):

![Scan](/images/hackthebox/bastion/scan.png)

Samba let's us authenticate as guest user, let's check what's on it:
![Samba](/images/hackthebox/bastion/smb.png)
The command `smbclient` takes the user password after the `%` symbol, but with
guest user no password is needed.

Let's mount the `Backups` share and explore it:
![Note](/images/hackthebox/bastion/note.png)

The share contains a folder named WindowsImageBackup, which is created by
Windows backup utility. The backups are contained in
[.vhd](https://en.wikipedia.org/wiki/VHD_(file_format)) (virtual hard disk)
files. After installing the software that allows us to mount those files `(sudo
apt install libguestfs-tools)` let’s search them:
![Backup](/images/hackthebox/bastion/backup.png)
![VHDs](/images/hackthebox/bastion/vhds.png)

There are two .vhd files. Let’s mount them:
![Boot drive](/images/hackthebox/bastion/boothd.png)

The first drive `(9b9cfbc3-369e-11e9-a17c-806e6f6e6963.vhd)` is the backup of the
boot partition and it doesn’t contain anything useful.

Mounting the second drive `(9b9cfbc4-369e-11e9-a17c-806e6f6e6963.vhd)`, we find
out that it’s the backup of the entire system:
![System drive](/images/hackthebox/bastion/systemhd.png)

After a bit of searching, we find that `SAM` and `SYSTEM` files are accessible,
therefore we can use [samdump](https://github.com/geocar/samdump) and the good
old [john the ripper](https://www.openwall.com/john/) to bruteforce the user
password:
![Password](/images/hackthebox/bastion/pass.png)

Let’s ssh into the box and get the flag:
![User flag](/images/hackthebox/bastion/user.png)

## User flag
```
9bfe57d5c3309db3a151772f9d86c6cd
```

After exploring the file system, we find a recently installed program called
mRemoteNG, which is used to manage remote connections.
![Programs](/images/hackthebox/bastion/programs.png)

A quick Google search tells us that this program saves the connections passwords
in a configuration file in `%APPDATA%` and encrypts them with AES using the MD5
hash of the string "mR3m" as key. Let’s search the configuration file:
![Configuration file](/images/hackthebox/bastion/configuration.png)

After printing the file content with the command `type confCons.xml` we find the
encrypted password:

```
aEWNFV5uGcjUHF0uS17QTdT9kVqtKCPeoC0Nw5dmaPFjNQ2kt/zO5xDqE4HdVmHAowVRdC7emf7lWWA10dQKiw==
```

Let’s use a tool to decrypt the password:
![Admin password](/images/hackthebox/bastion/adminpass.png)

Let’s ssh into the box as `administrator` and get the flag:
![Root flag](/images/hackthebox/bastion/root.png)

## Root flag
```
958850b91811676ed6620a9c430e65c8
```
