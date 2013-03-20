---
layout: post
title: "Journey from RequireJS to Browserify"
date: 2013-03-20 21:34
comments: true
categories:
  - web
  - node.js
  - browserify
---

Lately I have been very frustrated with [RequireJS][]. I have a feeling that I
have to fork almost every third party library I'm using in my projects. So
here's what I found when I did some research on [Browserify][].

<!-- more -->

## Issues with AMD

{% img right /images/browserify/requirejs-logo.png %}

First I want to little bit explain why RequireJS bugs me. The main reason is
the mess with the AMD define calls in various libraries. Some do them and some
don't. That's usually ok because you can easily shim the libraries with
RequireJS, but when you have dependencies between the third party libraries the
shit starts hitting the fan.

My latest frustration was with the Flotr2 graphing library. I decided to use
the regular build with the intention of shimming the Flotr global because the
AMD build was so much older. But there was a nasty surprise waiting for the
RequireJS users. Flotr2 depends on a library called Bean which is bundled into
Flotr and Flotr just expects to find the Bean library from the global
namespace. Ok, but the Bean library itself has an [UMD][] style AMD definition
which means that when it detects an AMD define function it uses it and skips
the creation of the global which results in broken Flotr2. It really bums me
out to fork libraries and remove AMD defines to make them work with AMD!

## Handlebars plugin for RequireJS

Another pain point has been the [require-handlebars-plugin][]. It's really
complex to configure to work properly with the r.js builds. It requires forked
versions of Handlebars, Underscore and json2 libraries. It also forces you to
include some i18n solution which collided with ours. Not fun. I just wanted to
use Handlebars with precomplication... So I grabbed the issue by the balls I
wrote my own Handlebars plugin for RequireJS.

<https://github.com/epeli/requirejs-hbs>

It's a lot simpler and works. I though it doesn't swap out the Handlebars
dependency for a runtime only version on builds. Pull requests welcome.

## Enter Browserify V2

{% img right /images/browserify/browserify-logo.png 300 %}

I've always preferred the node.js style module syntax over the AMD style. It's
simpler and easier to deal with because I don't have to match the dependencies
arrays with the function arguments list. `var mod = require("module");` is just
so nice in comparison. Also I haven't gotten any real benefits of the
asynchronous part of AMD. So I'm very open to replace it with simpler
synchronous requires. And now with the new version 2 of Browserify by substack
iet seems to more simpler than ever to use them in the browsers too.

So I made a list of features I require to consider it as a proper RequireJS
replacement.

  - Debugging: I don't want to see just one big bundle in the browser
  - CoffeeScript precompiling
  - Handlebars precompiling
  - Using libraries with globals. I want to stop forking libraries
  - Auto build on file changes

### Debugging

Well this one was easy. Just build the bundle with `--debug` flag

    $ browserify --debug main.js > bundle.js

and Browserify will inline source maps into the bundle and then just fire up
Chrome with source maps enabled from developer tools and it shows the original
files as there where separate files in the bundle.

### CoffeeScript precompiling

I was surprised find out that substack himself had written a CoffeeScript
plugin for Browserify called [coffeeify][] because he doesn't personally use
CoffeeScript.

It used by installing it locally to a project and calling `browserify` with a
`--transfrom` flag:

    $ npm install coffeeify
    $ browserify --transform coffeeify --debug main.js > bundle.js

It has a fun feature:

{% img /images/browserify/sourcemaps.png %}

Coffeeify supports source maps! Just awesome.

### Handlebars precompiling

Well, here Browserify had nothing to offer out of the box, but I took it as an
opportunity to get my self familiar the Browserify transform plugin API and
about an hour later had it working:

<https://github.com/epeli/node-hbsfy>

It does use the runtime only build of Handlebars in the final bundle. When
compared to RequireJS plugin API this was a really nice experience. A lot less
confusing: No need to figure out how to do ajax in development, file system
reading during build build or how to work with custom APIs. Just the familiar
node.js transform streams here.

### Using libraries with globals

[RequireJS]: http://requirejs.org/
[Browserify]: https://github.com/substack/node-browserify
[UMD]: https://github.com/umdjs/umd
[require-handlebars-plugin]: https://github.com/SlexAxton/require-handlebars-plugin
[coffeeify]: https://github.com/substack/coffeeify
