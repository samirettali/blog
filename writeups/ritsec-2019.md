---
title: "Ritsec 2019"
date: "2019-11-17"
tags: []
---

# Crypto
---
## pre-legend - 100 points
> 9EEADi^^8:E9F3]4@>^4=2J32==^D@>6E9:?8\FD67F=\C:ED64

This is a ROT47 encoded string, just decode it to get the flag:
```
$ tr '\!-~' 'P-~\!-O' <<< "9EEADi^^8:E9F3]4@>^4=2J32==^D@>6E9:?8\FD67F=\C:ED64"
https://github.com/clayball/something-useful-ritsec
```
At first, I went to the repository to find what's in it, but then I read in the
discord group that the flag was the link itself.

## shiny - 100 points

> .‡8]5);483‡5;  
[gold-bug.jfif](/images/ritsec-2019/gold-bug.jfif)

![](/images/ritsec-2019/gold-bug.jfif)

This challenge is a quote to The Gold Bug, a short story by Edgar Allan Poe, in
which a substitution cipher lead the protagonist to an adventure. We can use
[dcode.fr](https://www.dcode.fr/gold-bug-poe) to decode the given string.

### Flag
```
RITSEC{POEWASTHEGOAT}
```

# Stego
---
## HD Pepe - 300 points

> Pepe is alpha tier  
> [ctf-pepe.png](/images/ritsec-2019/ctf_pepe.png)

![](/images/ritsec-2019/ctf_pepe.png)

Running exiftool on the image gives us some interesting information:
{{< highlight text "hl_lines=22 28" >}}
$ exiftool ctf_pepe.png
ExifTool Version Number         : 11.75
File Name                       : ctf_pepe.png
Directory                       : .
File Size                       : 10 MB
File Modification Date/Time     : 2019:11:18 06:47:33-08:00
File Access Date/Time           : 2019:11:18 06:48:12-08:00
File Inode Change Date/Time     : 2019:11:18 06:47:39-08:00
File Permissions                : rw-r--r--
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 4500
Image Height                    : 4334
Bit Depth                       : 8
Color Type                      : RGB with Alpha
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Warning                         : [minor] Text chunk(s) found after PNG IDAT (may be ignored by some readers)
Exif Byte Order                 : Big-endian (Motorola, MM)
Image Description               : gh:cyberme69420/hdpepe
Resolution Unit                 : inches
Artist                          : degenerat3
Y Cb Cr Positioning             : Centered
Exif Version                    : 0231
Components Configuration        : Y, Cb, Cr, -
User Comment                    : version control hehe
Flashpix Version                : 0100
GPS Latitude Ref                : North
GPS Longitude Ref               : East
Image Size                      : 4500x4334
Megapixels                      : 19.5
GPS Latitude                    : 39 deg 1' 10.11" N
GPS Longitude                   : 125 deg 45' 12.20" E
GPS Position                    : 39 deg 1' 10.11" N, 125 deg 45' 12.20" E
{{< /highlight >}}

The User Comment field says something about version control, and the Image
Description field looks like a Github repository, which indeed it is. It
contains a python script that uses the alpha channel of an image to encode data
in it, these are the functions:
```python
def readBin(fname):
    f = open(fname, "rb")
    fstr = base64.b64encode(f.read())
    fdec = fstr.decode('utf-8')
    return fdec

def generateAValues(b64str):
    numArr = []
    for ch in b64str:
        val = ord(ch)
        n = 255 - val
        numArr.append(n)
    return numArr

def readImage(inputImg, encFile, outputImg):
    im = Image.open(inputImg) # Can be many different formats.
    pix = im.load()
    print("[+] Reading image...")
    x_size, y_size = im.size  # Get the width and hight of the image for iterating over
    sizeTup = (x_size, y_size)
    newImg = Image.new('RGBA', sizeTup)
    newPix = newImg.load()
    counter = 0
    print("[+] Reading target file...")
    binStr = readBin(encFile)
    print("[+] Generating new alpha values...")
    aVals = generateAValues(binStr)
    print("[+] Writing new image...")
    for x in range(x_size):
        for y in range(y_size):
            try:
                r, g, b, a = pix[x, y]
            except:
                r, g, b = pix[x, y]
                a = 255
            if counter >= len(binStr):
                newA = a
            else:
                newA = aVals[counter]
            counter += 1
            newPix[x, y] = (r, g, b, newA)
    print("[+] Saving new image...")
    newImg.save(outputImg)
```

The file that the script embeds in the image is read as a binary file, encoded
in base64 and then every character of the result string gets subtracted from the
value `255`. The resulting list of integers gets used as the value of the alpha
channel of each pixel.
Luckily, the repository contains a script called `examiner.py`, which opens an
image and prints the RGBA values of each pixel. We can use it as a foundation
to write a script that decodes the hidden content in an image:

```python
def decodeAValues(num_array):
    s = ''
    for num in num_array:
        val = 255 - num
        s += chr(val)
    return s

def examine(fname, maxpix):
    im = Image.open(fname) # Can be many different formats.
    pix = im.load()
    x_size, y_size = im.size  # Get the width and hight of the image for iterating over
    print("X-axis size: " + str(x_size))
    print("Y-axis size: " + str(y_size))
    num_array = []
    counter = 0
    for x in range(x_size):
        for y in range(y_size):
            if str(counter) == maxpix:
                return num_array
            try:
                r, g, b, a = pix[x, y]
            except:
                r, g, b = pix[x, y]
                a = 255
            num_array.append(a)
            # print("r: {}, g: {}, b: {}, a: {}".format(r, g, b, a))
            counter += 1
```

Simply running it against the given image, gives us the flag:
```
$ python examiner.py ctf_pepe.png 100
X-axis size: 4500
Y-axis size: 4334
b'RITSEC{M3M3S_CAN_B3_M4LICIOUS}'
```

# Web
---
## misdirection - 100 points

> Looks like someone gave you the wrong directions!  
http://ctfchallenges.ritsec.club:5000/

Visiting the link with a browser will end up in an infinite redirection.
Analyzing the requests with Burp we can read a well defined string by
concatenating the paths that we get redirected to:
![](/images/ritsec-2019/misdirection.png)

### Flag
```
RS{4!way5_Ke3p-m0v1ng}
```

# Forensics
---
## Take it to the Cleaners - 100 points

> People hide things in images all the time! See if you can find what the artist
> forgot to take out in this one!  
> [ritsec_logo2.png](/images/ritsec-2019/ritsec_logo2.png)

![](/images/ritsec-2019/ritsec_logo2.png)

With exiftool we can read a base64 encoded string in the User Comment field:
{{< highlight text "hl_lines=30" >}}
$ exiftool ritsec_logo2.png
ExifTool Version Number         : 11.75
File Name                       : ritsec_logo2.png
Directory                       : .
File Size                       : 4.3 kB
File Modification Date/Time     : 2019:11:18 07:33:08-08:00
File Access Date/Time           : 2019:11:18 07:33:09-08:00
File Inode Change Date/Time     : 2019:11:18 07:33:08-08:00
File Permissions                : rw-r--r--
File Type                       : PNG
File Type Extension             : png
MIME Type                       : image/png
Image Width                     : 328
Image Height                    : 154
Bit Depth                       : 8
Color Type                      : Palette
Compression                     : Deflate/Inflate
Filter                          : Adaptive
Interlace                       : Noninterlaced
Palette                         : (Binary data 129 bytes, use -b option to extract)
Warning                         : [minor] Text chunk(s) found after PNG IDAT (may be ignored by some readers)
Exif Byte Order                 : Big-endian (Motorola, MM)
Image Description               : Hi there! Looks like youre trying to solve the forensic_fails challenge! Good luck!
Resolution Unit                 : inches
Artist                          : Impos73r
Y Cb Cr Positioning             : Centered
Copyright                       : RITSEC 2018
Exif Version                    : 0231
Components Configuration        : Y, Cb, Cr, -
User Comment                    : RVZHRlJQe1NCRVJBRlZQRl9TTlZZRl9KQkFHX1VSWUNfTEJIX1VSRVJ9
Flashpix Version                : 0100
GPS Latitude Ref                : North
GPS Longitude Ref               : West
Image Size                      : 328x154
Megapixels                      : 0.051
{{< /highlight >}}

Decoding it gives us a string with the same format as the flag:
```
$ echo RVZHRlJQe1NCRVJBRlZQRl9TTlZZRl9KQkFHX1VSWUNfTEJIX1VSRVJ9 | base64 -d
EVGFRP{SBERAFVPF_SNVYF_JBAG_URYC_LBH_URER}
```

We can use `tr` to perform a rot13 decoding, which is just a Caesar cipher
with `13` as the key:
```
$ tr 'A-Z' 'N-ZA-M' <<< EVGFRP{SBERAFVPF_SNVYF_JBAG_URYC_LBH_URER}
RITSEC{FORENSICS_FAILS_WONT_HELP_YOU_HERE}
```

## Long Gone - 100 points
> That data? No it's long gone. It's basically history  
> http://us-central-1.ritsec.club/l/chromebin

After downloading the given archive and extracting it with `tar -xvf
chromebin.tar`, we can see that it's a backup of the user data of the Chrome
browser. Because the challenge description was talking about history, the
immediate thing that came to my mind is to search in the browser history. We can
do so by querying a sqlite3 database:
```
$ sqlite3 Chrome/User\ Data/Default/History "SELECT * FROM urls WHERE url LIKE '%ritsec%'"
76|https://www.google.com/search?hl=en&biw=673&bih=492&ei=BRnPXf76EKHI_Qb03bqQCg&q=us-central-1.ritsec.club%2Fl%2Frelaxfizzblur&oq=us-central-1.ritsec.club%2Fl%2Frelaxfizzblur&gs_l=psy-ab.3...12572.24888..69087...2.1..1.298.3372.37j4j1......0....1..gws-wiz.......0i71j0i273i70i249j0i273j0j0i67j0i131j38j0i30j0i5i30j0i8i30j0i8i10i30.xUoJ6M10dd8&ved=0ahUKEwi-kaP8lO3lAhUhZN8KHfSuDqIQ4dUDCAs&uact=
5|us-central-1.ritsec.club/l/relaxfizzblur - Google Search|3|0|13218330713643332|0
```
The second link looks promising, and infact, visiting it, gives us the flag.
### Flag
```
RITSEC{SP00KY_BR0WS3R_H1ST0RY}
```

## Vacation - 100 points
> These are my favorite places to visit  
> http://us-central-1.ritsec.club/l/chromebin

This challenge uses the same archive as before. This time the challenge
description seems to be referring to bookmarks. Chrome stores bookmarks in
`Chrome/User Data/Default/Bookmarks`. We can open the file with any editor and
find out that every bookmark has a letter as name and that's the flag, but
that's time consuming and not much efficient. We can instead use jq to parse
the json and get the flag straight:
```
$ jq -r '.roots.other.children[].name' Bookmarks
R
I
T
S
E
C
{
C
H
R
0
M
3
_
B
M
_
F
T
W
}
```

## findme - 400 points
> Find me! Challenge created by Security Risk Advisors for RITSEC CTF  
> [findme.pcap](/files/ritsec-2019/findme.pcap)

By analyzing the pcap file with Wireshark, we can see that there are two main
streams of data. The interesing one is the number 1, let's check it:
![](/images/ritsec-2019/findme.png)
It looks like there are two base64 encoded strings. The first one decodes to a
[link](https://www.youtube.com/watch?v=dQw4w9WgXcQ) to the Rickroll song, a
recurrent thing in this CTF.
The second one is where the juice is. It is a gzip archive, so after writing
the string in a file let's decode and extract it:
```
$ base64 -d data | gunzip
flag0000664000175000017500000000006213561713423011345 0ustar  ubuntuubuntuRITSEC{pcaps_0r_it_didnt_h@ppen}

CTRL-c to close
```

And there's our flag!

# Misc
---
## Crack me If You Can - 400 points
> Rev up your GPUs...
> nc ctfchallenges.ritsec.club 8080

This was to my surprise, a very easy challenge. After connecting with netcat to
the given host, it gives us NTLM and sha256crypt hashes. It also
suggests three wordlists for cracking the hashes, so I've merged them and piped
into `sort -u` to remove duplicates and then we can use hashcat with `-m 1000`
for NTLM hashes and with `-m 1800` for the sha256crypt ones.

```
$ nc ctfchallenges.ritsec.club 8080
Some moron just breached Meme Corp and decided to dump their passwords...
In the meantime, prepare your GPUs, and get Ready... Set.... and go CRACK!
However... We have a theory that the passwords might come from 500-worst-passwords.txt, darkweb2017-top10000.txt or probable-v2-top12000.txt
$6$yD1KHtTQ1vVU96je$Ff37nC1Xtg5FJcKhlhxQl4IXYdt0gHg8GWyNiyxHht5aYO.r4QG807DAo7PijwQSJIuclPniZ20b3dxAUitga/
energy
Good job.
ade09dd439a3676c6fd07b7e0007d50a
iamthebest
Good job.
$6$A23tnWFnWkfdc..8$/EAkiqPPh3BiP4qoqhBbd36iMNe7iKQzXDT5Q3k/VH2CBlu0tAfeNC1/zGNoCtaqjYblnzSS2Uf3Ff6bTJu8b.
council
Good job.
NICE JOB.  FLAG:RS{H@$HM31FY0UCAN}
```

## AlPhAbEtIcAl Challenge - 300 points
> 59:87:57:51:85:80{:40:50:56:08:82:58:81:08:18:85:57:87:48:85:88:40:50:56:59:15:56:11:18:85:59:51:}

This looks like a substitution cipher, in which every letter gets replaced by
another one. There are a plethora of tools to crack them based on dictionaries
and letters frequencies, but we need to convert the two digits to a single
characters for this tools to work. So I wrote a python script:
```python
import string

alphabet = string.ascii_letters + string.digits
s = '59 87 57 51 85 80 40 50 56 08 82 58 81 08 18 85 57 87 48 85 88 40 50 56 59 15 56 11 18 85 59 51'
converted = ''
d = {}

for symbol in s.split(' '):
    if not symbol in d:
        d[symbol] = alphabet[len(d)]
    converted += d[symbol]

print(converted)
```
Running it gives us this string `abcdefghijklmjnecboepghiaqirnead` which we can
use on [quipqiup](https://quipqiup.com) and set `abcdef=ritsec`:
![](/images/ritsec-2019/alphabetical-challenge.png)
And there's the flag!
