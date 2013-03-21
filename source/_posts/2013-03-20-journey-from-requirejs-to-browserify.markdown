---
layout: post
title: "Journey from RequireJS to Browserify"
date: 2013-03-20 21:34
comments: true
categories:
  - web
  - node.js
  - browserify
  - requirejs
  - amd
---

Lately I have been very frustrated with [RequireJS][]. I have a feeling that I
have to fork almost every third party library I'm using in my projects. So I
started investigating [Browserify][] as an alternative. Here's what I found.

<!-- more -->

## RequireJS

{% img right /images/browserify/requirejs-logo.png %}

First I want to little bit explain why RequireJS bugs me. The main reason is
the mess with the [AMD][] define functions calls in various libraries. Some do them
and some don't. That's usually ok because you can easily shim the libraries
with RequireJS but when you have dependencies between the third party
libraries the shit starts hitting the fan.

### Flotr2 and weird define calls

My latest frustration was with the Flotr2 graphing library. I decided to use
the regular build with the intention of shimming the Flotr global because the
AMD build was so much older. But there was a nasty surprise waiting for the
RequireJS users. Flotr2 depends on a library called Bean which is bundled into
Flotr and Flotr just expects to find the Bean library from the global
namespace. Ok, but the Bean library itself has an [UMD][] style AMD definition
which means that when it detects an AMD define function it uses it and skips
the creation of the global which results in broken Flotr2. It really bums me
out to fork libraries and remove AMD defines to make them work with AMD!

### Handlebars plugin

Another pain point has been the [require-handlebars-plugin][]. It's really
complex to configure to work properly with the r.js builds. It requires forked
versions of Handlebars, Underscore and json2 libraries. It also forces you to
include some i18n solution which collided with ours. Not fun.  I just wanted to
use Handlebars with precompilation (In the end I ended up writing my own
Handlebars [loader plugin][requirejs-hbs]).

These are just few of the issues I've had with RequireJS. Not really anything
blocking but there is just always some annoyances especially with build the
step and it doesn't help that it doesn't give proper error messages when some
thing goes wrong.

## Enter Browserify V2

{% img right /images/browserify/browserify-logo.png 300 %}

I've always preferred the node.js style module syntax over the AMD style. It's
simpler and easier to deal with. Also I haven't gotten any real benefits of the
asynchronous part of AMD. So I'm very open to replace it with simpler
synchronous requires. And now with the new version 2 of Browserify by substack
it seems to more simpler than ever to use them in the browsers too.

So I made a list of features I require to consider it as a proper RequireJS
replacement:

  - Debugging: I don't want to see just one big bundle in the browser
  - Using libraries with globals
  - CoffeeScript precompiling
  - Handlebars precompiling
  - Multiple versions of the same dependency

### Debugging

Well this one was easy. Just build the bundle with `--debug` flag

    $ browserify --debug main.js > bundle.js

and Browserify will inline source maps into the bundle and then just fire up
Chrome with source maps enabled from developer tools and it shows the original
files as there where separate files in the bundle.

But currently this seems to work only with Chrome. In others you get just a
huge bundle of Javascript. Source maps are coming to Firefox but I wouldn't put
my hopes up for IE...

### Using libraries with globals

Lets face it. The browser world just is not going to adopt any module system
unanimously any time soon. We just have to work with libraries exposing them as
globals on the window object. I just want be able to use them without forking
them.

Browserify does a decent job about this. If you just require a random
Javascript file exposing globals the `require` call will return `undefined` but
after that you can just access the globals. Only requirement seems to be that
the library exposes itself explicitly to the `window` object. If it uses a
`var` statement to declare the global then you get into trouble. In Browserify
that global will be hidden inside the module closure. For those cases you have
to fork the library or come up with some transform plugin.

#### Shims

In RequireJS you can configure shims for the globals. With shims you can use
the globals just they had the AMD define without touching the library code. It
appears that you can do the same in Browserify just by writing simple wrapper
modules.

Example with jQuery:

```javascript jquery.shim.js
// jQuery does not export itself as node.js/CommonJS module
require("./jquery.js");
// but after the require we can just export the jQuery
// global from this module
module.exports = window.jQuery;
```

And then for example in jQuery plugin module you can just do:

```javascript myplugin.jquery.js
var $ = require("./jquery.shim");
$.fn.myplugin = function() { ... };
```

Also in a Flotr like case where you have a library expecting a global but you
have it as a non global module you can just put the global back in the shim:

```javascript flotr2.shim.js
var bean = require("bean");
window.bean = bean;
require("flotr2");
module.export = window.Flotr;
```


### CoffeeScript precompiling

Substack himself has written a CoffeeScript plugin for Browserify called
[coffeeify][]. Since he isn't a CoffeeScript user he is looking for maintainers
for the plugin. Nevertheless the plugin works surprisingly well.

It is used by installing it locally to a project and calling `browserify` with
a `--transfrom` flag:

    $ npm install coffeeify
    $ browserify --transform coffeeify --debug main.js > bundle.js

By working surprisingly well I mean this fun little feature:

{% img /images/browserify/sourcemaps.png %}

Source maps!

### Handlebars precompiling

Well, here Browserify had nothing to offer out of the box but I took it as an
opportunity to get my self familiar the Browserify transform plugin API and
about an hour later had it working:

<https://github.com/epeli/node-hbsfy>

When compared to RequireJS plugin API this was a really nice experience. A lot
less confusing: No need to figure out how to do ajax in development, file
system reading during build build or how to work with custom APIs. Just the
familiar node.js transform streams here. I like it a lot.

### Multiple versions of the same dependency

As Browserify uses [npm][] as its package manager you should be aware how npm
pulls in dependencies. If two modules have a same dependency but on a
different versions it will download two copies of this dependency and those
will be put into the Browserify bundle too! Luckily npm is smart enough to
combine those dependencies if their [semver][] version strings are compatible.

This means that if you use for example Underscore in you project root it must
be compatible with every sub dependency of your dependencies to get only one
copy of Underscore to your Browserify bundle. But I do think this is a nice
feature because then you don't get into any trouble using libraries with
conflicting dependencies. You only get few more bytes. It's just something to
be aware.

## Conclusion

This journey is still on going but I think will try using Browserify in my next
project or convert old one from RequireJS.

To conclude here a list of pros and cons.

### Pros

  - Always bundling
    - No running into build problems later on
  - Simpler syntax: `module.exports = ...` FTW!

### Cons

  - Always bundling
    - Debugging old browsers is not getting any easier


## Next


[RequireJS]: http://requirejs.org/
[Browserify]: https://github.com/substack/node-browserify
[AMD]: https://github.com/amdjs/amdjs-api/wiki/AMD
[requirejs-hbs]: https://github.com/epeli/requirejs-hbs
[UMD]: https://github.com/umdjs/umd
[require-handlebars-plugin]: https://github.com/SlexAxton/require-handlebars-plugin
[coffeeify]: https://github.com/substack/coffeeify
[npm]: https://npmjs.org/
[semver]: https://npmjs.org/package/semver
