---
title: "Bitkoff Bank - Cybrics Quals 2019"
date: 2019-07-21T21:50:37+02:00
tags:
    - "CTF"
    - "CybricsQuals2019"
    - "Writeup"
---

![Description](/images/cybrics-2019/bitkoff-bank/task.png)

This challenge is a web based challenge, here is the registration/login page:
![Web](/images/cybrics-2019/bitkoff-bank/web.png)

After the registration we are provided with a simple web interface for mining
coins:
![UI](/images/cybrics-2019/bitkoff-bank/ui.png)

We immediately see that we need 1 USD to buy the flag, we can mine 0.0000000001
BTCs with a click and we can convert BTC into USD and viceversa.

The thing that immediately came to my mind is to use `curl` to automate the
BTC mining, so this is the command I used:
```bash
for i in {0..10000000}; do
curl -i -s -k  -X $'POST' -H $'Cookie: name=samir; password=samir' \
    -b $'name=samir; password=samir' \
    --data-binary $'mine=1' $'http://95.179.148.72:8083/index.php' 2>&1 &
done
```

I've done the request appending `&` to the command so that it forks in the
backround, making the mining process much faster. I know it could have been done
better, probably with python and async requests, but there were 12+ hours.

After less than one hour the amount of BTCs allowed us to buy the flag.

### Flag
```
cybrics{50_57R4n93_pR3c1510n}
```

Note: buying the auto-miner was not a good idea because you could have bought as
many as you want but they were doing only one click a second. And even then, the
page would refresh every second, making the page containing the flag disappear.
Luckily, I had burp intercepting the traffic.
