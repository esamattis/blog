---
layout: post
title: "Improving console.log for Node.js"
date: 2012-09-30 22:33
comments: true
categories:
 - node.js
---

Node.js gives you four methods for logging stuff `console.log()`,
`console.info()`, `console.warn()`, and `console.error()`. These could go
pretty far, but unfortunately they fall bit short since their output does not
give any indication which method was used for logging except for the output
stream.  Which in my opinion is bit confusing. But I do like their [API][].
They can do `printf` like formating, pretty printing objects and they can even
handle objects with circular references.

So I've written a little module called *clim* (**C**onsole.**L**og **IM**proved) which
gives some superpowers to console.log and friends.

<!--more-->

## Usage

You can shadow the original `console` or monkeypatch it once and for all

```javascript
var clim = require("clim");

// Just shadow it
var console = clim();

// or monkeypatch it!
clim(console, true);

```

Now you can use `console.log` just like before, but the output is more detailed:

```javascript
console.log("message with log");
console.info("message with info");
console.warn("message with warn");
console.error("message with error");
```

```text
Sun Sep 30 2012 23:06:24 GMT+0300 (EEST) LOG message with log
Sun Sep 30 2012 23:06:24 GMT+0300 (EEST) INFO message with info
Sun Sep 30 2012 23:06:24 GMT+0300 (EEST) WARN message with warn
Sun Sep 30 2012 23:06:24 GMT+0300 (EEST) ERROR message with error
```

Also now all the methods write to stderr for the sake of consistency. By
default `log` and `info` writes to stdout and `warn` and `error` to stderr, but
this causes some pains when redirecting logs to a single file. Log order might
be messed up depending on IO buffering etc.

## Background

The main idea behind this module is to keep the original API of
`console.log()`, because then it is possible to just drop it in a project
without any refactoring. If you encouter any inconsistencies with with it
please file a [bug][].


*clim* also exposes few hooks that can be used to customize its behaviour. You
can modify the date string, change log target from stderr to back stdout or
even to a database, add default prefixes to console objects and inherit from
them. For more details view the project page on Github:

[https://github.com/epeli/node-clim](https://github.com/epeli/node-clim)

[API]: http://nodejs.org/api/stdio.html
[clim]: https://github.com/epeli/node-clim
[bug]: https://github.com/epeli/node-clim/issues
