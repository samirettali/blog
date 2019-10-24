---
title: "LogCaesar - Crypto - Reply Challenge 2019"
date: 2019-10-13T12:15:42+02:00
tags: [Reply cyber security 2019, Crypto, Cracking]
draft: false
---

For this challenge we were given an encrypted file and a python script with an
`encrypt` function:
```python
#!/usr/bin/env python3
import sys

if len(sys.argv) != 4:
    print("Usage: "+sys.argv[0]+" message_file key encrypted")
    sys.exit(1)

def encrypt(message, key):
    with open(message, 'rb') as content_file:
        content = content_file.read()
    if len(content) != 256:
        raise Exception('This is a block cipher, messages have to be exactly 256 bytes long')
    ciphertext = list(' ' * 256)
    for i in range(0,256):
        new_pos = (3**(key+i)) % 257
        ciphertext[new_pos-1] = ((content[i])^i)^(new_pos-1)
    return bytes(ciphertext)

ciphertext = encrypt(sys.argv[1],int(sys.argv[2]))
with open(sys.argv[3],'wb') as encryped_file:
    encryped_file.write(ciphertext)
```

What the function does is a mix between transposition and transformation. Each
character's new position is calculated with this formula where `i` is the
current character's position:
```
(3**(key+i)) % 257
```

And the character itself becomes:
```
((content[i])^i)^(new_pos-1)
```

Because we didn't had much time to do things well, I wrote a function that given
the new character's position it does a bruteforce on all 256 possibile original
positions and finds the correct one:
```python
def find(n, key):
    for i in range(256):
        if 3**(key+i) % 257 == n:
            return i
```

And here's the decrypt function:
```python
def decrypt(content, key):
    cleartext = list(' ' * 256)
 
    for i in range(256):
        orig_pos = find(i+1, key)
        cleartext[orig_pos] = (content[i] ^ (orig_pos)) ^ (i)
 
    s = ''
    for byte in cleartext:
        s += chr(byte)
    return s
```

Knowing that the flag format is `{FLG:here_goes_the_flag}` we can write a
bruteforce function that tries all the `256` keys and search for the flag:

```python
def crack(filename):
    enc = open(filename, 'rb').read()
    for i in range(256):
        dec = decrypt(enc, i)
        if '{FLG:' in dec:
            print(dec)
```

And here's it's output:
```
Jº>ÞÖ/+hEò|I$S
¥}¯Qm7ÓÝ½Ñ(*À´iÎ¦±ÑÔµH¿ÛDå­¸Á¥ôQ2é§¶§¹iä±+?«,3{FLG:but_1_th0ught_Dlog_wa5_h4rd}
ÞçÉ1Ã²$ã¤Tã½£s»cÙ|ûUÙ§ã¤=à;¼")ðåÊÅÅÜ#øù:µ¯ò¦gúíyó3þªÍyWgd^ÀÊaGÑ2Øæïéï^òÉ3!M`º´ÇÄÃ³Uêúæxa¸h¤BEYEçFò¤`öJ,|dÿÅ¤òÆõvÏ³;U¤
```

We can see the flag on the second line.
## Flag
```
{FLG:but_1_th0ught_Dlog_wa5_h4rd}
```
