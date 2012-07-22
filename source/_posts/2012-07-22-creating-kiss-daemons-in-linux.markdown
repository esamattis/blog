---
layout: post
title: "Creating KISS daemons in Linux"
date: 2012-07-22 13:53
comments: true
categories:
  - linux
  - sysadmin
---

Daemonizing processes in Linux and running them on boot is a very easy task in
theory, but the variety of different Linux distributions tend to make it
incredible hard sometimes. So here's my take on Daemonizing processes without a
headache.

<!--more-->

## Background

When starting a process on boot there are usually few requirements I need

  1. Drop privileges from root
  1. Redirect stdout/stderr to a log file
  1. Set current working directory
  1. Set environment variables
  1. Write a pid file
  1. And finally daemonize the process


These all are fairly trivial tasks to implement in the actual application, but
also these are the same for every app. I like to keep things DRY. When I'm
creating for example some simple prototype application in Node.js I really
don't care to think about which logging framework to use or how to do a double
fork in a environment which don't even have a fork call to begin with.

I'm usually working with Debian and Ubuntu based distros. They both have
a init system which can be used to accomplish these requirements.

Debian uses `/etc/init.d/` style scripts and Ubuntu uses Upstart which is
actually somewhat usable. Here's my [Redis script][redis] for example, but
that's not usable in Debian of course. Debian gives you a skeleton script in
`/etc/init.d/skeleton` which can be used to create a daemon on boot up. That's
159 lines long! Pretty complex for such a simple task I'd say.


## Alternative

Luckily there are alternative tools for daemonizing processes. One of the
simplest ones I've encountered is called [daemon][]. This tool has been around
for a while, but I've just found out about it. I think the name makes it kinda
hard to stumble upon...

It's easily installable via apt-get

    # apt-get install daemon

Then it is just matter of running the command on boot up. I don't usually care
about the run levels so I just put it in `/etc/rc.local` which is the last
script executed during Debian and Ubuntu boot process.


My daemon setup for Node.js servers is usually something like this:

    daemon \
        --name myapp \
        --user user \
        --chdir /home/user/myapp/ \
        --output /home/user/myapp/myapp.log \
        --pidfile /home/user/myapp/myapp.pid \
        --inherit \
        --env="NODE_ENV=production" \
        /usr/local/bin/node /home/user/myapp/server.js

It's Fairly straightforward. Just make sure that the pid and log directories
are writable by the user. The `--inherit` switch is only required when defining
custom environment variables with `--env` so that you don't loose previously
defined environment variables such as `PATH`. Checkout the [man page][] for
details.


[redis]: https://gist.github.com/3159365
[daemon]: http://libslack.org/daemon/
[man page]: http://libslack.org/daemon/manpages/daemon.1.html

