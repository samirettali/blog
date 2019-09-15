---
title: "ProCTF - Cybrics Quals 2019"
date: 2019-07-21T12:12:55+02:00
tags:
    - "CTF"
    - "CybricsQuals2019"
    - "Writeup"
---

For this challenge, we are provided with the username and the password for a machine.
![Information](/images/cybrics-2019/proctf/pro-task.png)

The ssh session gives us a strange shell:
![Shell](/images/cybrics-2019/proctf/shell.png)

By trying some commands we run into an error message:
![Prolog](/images/cybrics-2019/proctf/prolog.png)

Searching the error message on Google tells us that it's probably Prolog.
The [prolog's documentation](https://www.swi-prolog.org/pldoc/man?predicate=shell/2) tells us that the syntax to run a system command is:
```
shell('command').
```

Let's try:
![Command](/images/cybrics-2019/proctf/command.png)

Searching through the directories we find the flag file in the user's home:
![Flag](/images/cybrics-2019/proctf/flag.png)


After I solved the challenge, reading the documentation, I found out that
running the `shell` command without parameters would have gave me the default
system shell, making it easier to move through the system.

### Flag
```
cybrics{feeling_like_a_PRO?_that_sounds_LOGical_to_me!____g3t_it?_G37_1T?!?!_ok_N3v3Rm1nd...}
```
