---
title: "File Rover - Web - Reply Challenge 2019"
date: 2019-10-13T12:31:30+02:00
tags: [Reply cyber security 2019, Web, JWT]
draft: false
---

In this challenge we had a [link](https://gamebox3.reply.it:20443/) to a site.
The first thing that was peculiar about it was the invalid certificate. After
telling the browser to ignore it, we were presented with a some download links:

![](/images/reply-2019/download.png)

Reading the source code of the page we can see an old commented link to a file
called `flag.txt`:
```html
<tr>
    <td>flag.txt</td>
    <td>4 Bytes</td>
    <td class="download-col">
        <button type="button" class="btn btn-light" disabled="disabled">EXPIRED</button>
    </td>
</tr>
```

The link for `future.jpg` points to
```
download.php?file=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJmaWxlbmFtZSI6IjdiNDIxZ
GYxMWE1M2UzM2Q5MjllZjRjMDI1Zjc5ZjgzIn0.dNHioi9RiEpyUtcOD6G5CBXU0EUi2HTl05eOvkFec
myoFyn5CWq5ExbwYLX8QE85qBaskOT-mtq3_XWwTxmGIKhPg8eOVuqqhU7nCg2eEdKwp-mjaPBnmDfBi
nvcfXEhItLi8T1hmMVgxaWSxQ1ZZKu4t-SFbuHOgesE6s9oBBiFMX92HSJbE3PnpAp6y6CYsI4hXBdzf
AXERfmV0lV8-SRtKgKFwVTI-zmBlEGSReszw-NoDgGfFGF9e1tKjVb8sE3o5IYv5M5AmDjs8qWe5JO39
IQeTJqn4r6Db6zPWjHKlheqFLrfytWQF9MvjDRU5CIu3tIRWYnylnVUA3Slrw
```

I recognized the `JWT` token structure and used [jwt.io](https://jwt.io) to read
it. The header is:
```json
{
  "typ": "JWT",
  "alg": "RS256"
}
```
so a `rsa 256` key was used to sign the token, and the payload is:
```json
{
  "filename": "7b421df11a53e33d929ef4c025f79f83"
}
```

The immediate thought was that the `filename` parameter could be the hash of the
filename, and it was indeed:
```bash
$ echo -n "future.jpg" | md5sum
7b421df11a53e33d929ef4c025f79f83  -
```

We could try to use the hash of `flag.txt` to create our own token but we need
the key used to create it. A quick bruteforce try with some tools and wordlists
did not work, and after a bit of research we found an [article](https://habr.com/en/post/450054/) explaining a
vulnerability that allowed to make the server use the public key to verify the
signature instead of the private key. Remembering that the web site certificate
was invalid, we thought about trying to use it to create to custom token to
download `flag.txt`.
Here is the final token:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaWxlbmFtZSI6IjE1OWRmNDg4NzU2MjdlMmY3ZjY2ZGFlNTg0YzVlM2E1In0.gkPHJYEXF0WEpvwzI4FxDkFGoG6dpBvVMhq6ibsl28w
```

## Flag
```
{FLG:n0_b4ckup_n0_m3rcy}
```
