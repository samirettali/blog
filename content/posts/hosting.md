---
title: "How I manage my website"
date: 2019-11-21T07:54:35+01:00
tags: ["Hugo", "Github", "Github Actions", "CI"]
---

I started the blog this summer, and it was a completely different thing at the
beginning. I was using Jekyll to build it and Github Pages to host it, but then
I bought a domain name and I wanted to try out Firebase.  

It was working great but there was no learning pretty much as this is just a
small static website with no advanced functionalities.  

After writing a post, I just ran `jekyll build` to generate the HTML and
`firebase deploy` to deploy the generated HTML to Firebase. Some time later I
moved to Hugo, but the workflow was pretty much the same.

The thing is that I like building stuff and always learn something new. So I
started using a VPS from Digital Ocean and I followed
[this](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04)
really clear and easy tutorial to setup SSL with Let's Encrypt on nginx.

## How it works now
Since I use git to version control my website, I wanted to take advantage of
that, so this is my current workflow:

1. Write a post
2. Commit and push to `master`
3. Github Actions builds from `master` to `public`
4. A cron job on the VPS pulls from `public`

Pretty easy right? Let's see how it's done!

## Repository creation
If you already have your website on version control, you can skip to the
[next](#github-actions) section.

After creating a repository on Github, let's create the website structure, make
it a repository and add the remote:
```
$ hugo new website
$ cd website
$ git init
$ git remote add origin git@github.com:samirettali/website
```

Let's add the files to the repository:
```
$ git add .
$ git commit
$ git push --set-upstream origin master
```

You can configure Hugo pretty much however you want, choosing your theme,
website name and a whole lot of stuff, the official
[documentation](https://gohugo.io/getting-started/quick-start/#site-configuration)
is a nice place to start.


## Github Actions
Now we have to setup the Github Action that will automatically generate the HTML
after every push and put it in another branch, in this example it will be called
`public`.

Github Actions can be created from the web interface, but all it does is create
a file in `.github/workflows` called `main.yml`.

So let's create it with our favorite editor and write the following code:

```yaml
name: Build site

on: [push]

jobs:
  build-deploy:
    runs-on: ubuntu-18.04
    steps:
    - uses: actions/checkout@master

    - name: Setup Hugo
      uses: peaceiris/actions-hugo@v2.2.2
      with:
        hugo-version: '0.58.3'

    - name: Build
      run: hugo --minify

    - name: Deploy
      uses: peaceiris/actions-gh-pages@v2.5.0
      env:
        ACTIONS_DEPLOY_KEY: ${{ secrets.ACTIONS_DEPLOY_KEY }}
        PUBLISH_BRANCH: public
        PUBLISH_DIR: ./public
```

We will need a pair of ssh keys to allow Actions to push to a new repository, so
after generating them with `ssh-keygen`, let's add the public key as a deploy
key, you can name it whatever you want:
![](/images/hosting/deploy-key.png)

And then, let's add the private key as a secret called `ACTIONS_DEPLOY_KEY`:
![](/images/hosting/secret-key.png)

Now Github Actions should be able to build from `master` to `public` and our
repository should be ready to go!

## Server setting
The last thing to do is to setup our server to automatically pull from `public`.
We will use a bare repository, which basically have the `.git` folder separated
from the working tree, which will contain the files of the repository.

After copying the previously generated keys to our server, let's add it to the
`~/.ssh/config` file, so that git will use it:
```
Host github.com-website
  HostName github.com
  User git
  IdentityFile ~/.ssh/key
```
I like to use a different key for every project that is not on my personal
computer, so that, for example, if I lose a key or it gets compromised, I only
have to change that one.

Now we have to set up a bare local repository and tell it where to pull from:
```
$ git init --bare website
$ cd website
$ git remote add origin github.com-website:samirettali/website
$ git --git-dir=/home/samir/website --work-tree=/var/www/html fetch origin
```

Note that the current user must have permissions to write in `/var/www/html`,
and you can of course use your web server directory instead of `/var/www/html`,
which is mine.

Now we need to tell git to use the files in the `public` branch:
```
git --git-dir=/home/samir/website --work-tree=/var/www/html checkout public
```

And now we can setup cron to periodically pull from Github. After running
`crontab -e` let's add this line:
```bash
*/15 * * * * git --git-dir=/home/samir/website --work-tree=/var/www/html pull 2>>/home/samir/website-errors.log
```

Now cron will pull every 15 minutes from Github, and it will log any errors in a
file called `website-errors.log` in the user home. You can use
[crontab.guru](https://crontab.guru/) to generate the job that you want.

## Ending
From now on, after every push, Github Actions will log in the Action tab the
operation success:
![](/images/hosting/action.png)

If it fails we will receive a mail and of course the `public` branch will not be
modified and we can inspect the Actions tab on Github to find what's wrong.

This setup can be easily adapted to work with Jekyll or other static website
builders, of course there are many other better ways, but this is the one that
fits my needs the most. It can become really powerful if, for example, you want
to plan posts publishing by using `publishDate` option in Hugo and set the
Github Action to build your site every hour.

I hope this will be useful for someone, don't hesitate to contact me for
clarifications, thanks for reading!
