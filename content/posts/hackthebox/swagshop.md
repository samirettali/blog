---
title: "Swagshop - HackTheBox"
date: 2019-07-27T17:39:53+02:00
tags:
    - "CTF"
    - "HackTheBox"
draft: true
---
Iniziamo con un port scan:
![Scan](/images/hackthebox/swagshop/scan.png)

Vediamo cosa c'è sul server web:
![Web](/images/hackthebox/swagshop/web.png)

Sul server web gira Magento, una piattaforma eCommerce. In genere quando ci
sono dei cms medio-grandi c'è un exploit da usare. Cerchiamo con
searchsploit:

![Searchsploit](/images/hackthebox/swagshop/searchsploit.png)

Cerchiamo di capire quale versione di Magento è in esecuzione sul server web. Cercando online scopriamo che visitando `http://10.10.10.140/downloader` ci viene presentato un form di login che include la versione di Magento:
![Version](/images/hackthebox/swagshop/version.png)

Vediamo se l'exploit con codice 37977 (che permette di eseguire
codice su una versione di Magento vulnerabile) funziona su questa versione.
Scarichiamolo con questo comando:
![Searchsploit](/images/hackthebox/swagshop/searchsploit2.png)

Apriamolo con un editor e modifichiamo la variabile `target` con il valore
`http://10.10.10.140/index.php`. Leggendo il codice vediamo che sfrutta una
SQL Injection per creare un utente amministratore con nome forme e password
forme. Eseguiamolo:

![Exploit](/images/hackthebox/swagshop/exploit.png)
