---
title: "Sender - Cybrics Quals 2019"
date: "2019-07-21"
tags:
    - "CTF"
    - "CybricsQuals2019"
    - "Writeup"
---
![Task](/images/cybrics-2019/sender/task.png)

For this challenge, we have a link with some intercepted data:
![Data](/images/cybrics-2019/sender/data.png)

It's the traffic incerception of a mail sent from `fawkes@ugm.cybrics.net`. The
body of the mail is encoded with the quoted-printable encoding. Let's save it in
a file and decode it:
![Mail](/images/cybrics-2019/sender/mail-body.png)

So we do have the password for an archive. After a bit of thinkering I thought
to search if there are received mails. The default port for `POP3` is 110, so
let's try:
![POP3](/images/cybrics-2019/sender/pop3.png)

Let's read the mail with `RETR 1:`
![Received mail](/images/cybrics-2019/sender/received-mail.png)

The mail contains an attachment called `secret_flag.zip`. Let's use `tee` to
write the output of netcat to a file:
```
nc ugm.cybrics.net 110 | tee received-mail
```
and run the previous commands to authenticate and retrieve the mail.

We now have to use an editor to extract the base64 encoded attachment, so delete
the lines from 1 to 34 and from 1899 to 1901. We also have to remove the line
endings to obtain a valid base64 string.

I personally use vim and the command to remove all line endings is `:%s/\n//g`.

Let's create the archive and extract it:
![Archive](/images/cybrics-2019/sender/archive.png)

Even if `base64 -d` says that the input is not valid, it's because `cat` adds a
new line at the end.

Opening the PDF file we find the flag:
![PDF](/images/cybrics-2019/sender/pdf.png)

### Flag
```
cybrics{Y0uV3_G0T_m41L}
```
