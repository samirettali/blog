---
title: "Dotfiles"
date: 2019-07-15T01:04:41+02:00
tags: ["dotfiles", "ricing"]
draft: true
---

Dopo anni di utilizzo di GNU/Linux e sistemi Unix-like mi sono deciso a trovare
un sistema efficiente per mantenere i miei dotfiles aggiornati su tutte le
macchine che uso.

Cercando varie soluzioni online ho deciso di utilizzare un **bare git
repository**.

Un repository git classico, creato con il comando `git init <directory>`, crea
la cartella indicata con il parametro `directory`, chiamata **working tree**,
all'interno della quale potremo scrivere i nostri file.  All'interno del working
tree viene creata la cartella `.git` che conterrà tutti i dati relativi al
repository, ad esempio i branch, le configurazioni e i commit.

Ecco la struttura di un repository appena creato:
![Struttura di un repository](/images/dotfiles/repo.png)

# Cos'è quindi un bare git repository?
Un bare git repository, a diffenza di uno normale, crea solo la cartella `.git`
e ci permette di indicare un working tree arbitrario. Per gestire i nostri
dotfiles, useremo quindi come working tree la cartella home del nostro utente,
dato che tutti i file di configurazione saranno lì.

Nell'[articolo](https://www.atlassian.com/git/tutorials/dotfiles) di Atlassian è tutto
descritto alla perfezione.

### I miei dotfiles 
Con il comando:
```
$ curl -Lks bit.do/samirdotfiles | bash
```
viene eseguito uno script che si occupa di clonare il
[repository](https://github.com/samirettali/dotfiles) con i miei dotfiles, fare
il backup di eventuali file esistenti, collocare i miei nelle cartelle
corrette e installare i vari plugin di tmux e zsh.


### Configurazione e plugins zsh
TODO prompt
Utilizzo [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) per gestire
le configurazioni, i plugin e i temi, e i plugin che uso di più sono

[fzf](https://github.com/junegunn/fzf): permette di cercare nella storia dei
comandi in modo efficiente

[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions):
suggerisce il completamento del comando che stiamo scrivendo con quello più
recente che gli corrisponde.

### Aliases e funzioni di zsh

| Comando | Descrizione |
|-|-|
| tl | mostra una lista delle sessioni di tmux |
| t [session] | se non viene passato il parametro `session`, viene eseguito il comando `tmux`, altrimenti viene creata una sessione di nome `session` o ci si collega se esiste già |

`f <name>`: ricerca ricorsiva con `find` di cartelle e file che contengono la
stringa `name` nel nome.

`vack <string>`: apre con vim tutti i file che contengono la stringa indicata
all'interno della cartella corrente e delle sue sotto-cartelle.

`up <number>`: torna indietro nella gerarchia delle directory, in questo modo:

`up 1` = `cd ..`

`up 2` = `cd ../..`

`up 3` = `cd ../../..`

`tad`: crea una cartella e esegue al suo interno una sessione di tmux. Quando la
sessione di tmux viene chiusa la cartella viene eliminata.

`ldf`: sposta il file modificato più recentemente dalla cartella Downloads alla
cartella corrente.

`sifr <string1> <string2>`: sostituisce tutte le occorrenze di `string1` con
`string2` nei file contenuti nella cartella corrente e sutte le sue
sotto-cartelle.

`groot`: torna alla root di un repository git.

Questo è il mio tipico setup con tmux e neovim
[![Setup](/images/dotfiles/setup.png)](/images/dotfiles/setup.png)
Il pannello a sinistra è [NERDTree](https://github.com/scrooloose/nerdtree) e
mostra i file nella directory dove è stato aperto vim.

Il pannello a sinistra è [tagbar](https://github.com/majutsushi/tagbar) e mostra
packages, variabili e funzioni, evidenziando la funzione nella quale si trova il
cursore.
La linea in alto invece mostra i buffer aperti e per spostarmi tra essi uso
`ctrl+n` e `ctrl+p`.

Ho rimpiazzato la statusline con [lightline](https://github.com/itchyny/lightline.vim)
e mostra, a sinistra, la modalità corrente, e a destra il codice esadecimale del
carattere sotto il cursore, il nome dell'eventuale branch corrente e il tipo di
file.

Il pannello nero in basso è tmux.

### Neovim

`K`: esegue il comando `man` sulla parola sotto il cursore.

`gV`: seleziona il testo inserito durante l'ultimo utilizzo dell'insert mode.

`\`: scrive il comando `:vsplit ` lasciando la possibilità di aggiungere il nome
di un file da aprire nel nuovo split.

`-`: come il comando precedente, però con uno split orizzontale.

`<Leader>cp`: copia e incolla il paragrafo corrente, in base alla definizione di
paragrafo di vim.

`<Leader>ze`: cancella le righe vuote.

`<Leader>u`: sostituisce la parola sotto il cursore con la sua versione
maiuscola.

`<Leader>l`: sostituisce la parola sotto il cursore con la sua versione
minuscola.

Questi due mapping servono a mantenere il testo selezionato dopo averlo
tabulato di una posizione:
```vim
vnoremap < <gv
vnoremap > >gv
```

![Tmux](/images/dotfiles/tmux.png)
