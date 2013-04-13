---
layout: post
title: "Journey from RequireJS to Browserify"
date: 2013-03-22 13:37
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
the mess with the [AMD][] define functions calls in various libraries. Some do
them and some don't. That's usually ok because you can easily shim the
libraries but when you have dependencies between the third party libraries the
shit starts hitting the fan.

### Disappearing globals

My latest frustration was with the Flotr2 graphing library. I decided to use
the regular build with the intention of shimming the `Flotr` global because the
AMD build was so much older. But there was a nasty surprise waiting for the
RequireJS users. Flotr2 depends on a library called Bean which is bundled into
Flotr2 and it just expects to find the Bean library from the global namespace.
Ok, but the Bean library itself has an [UMD][] style AMD definition which means
that when it detects an AMD define function it uses it and skips the creation
of the global which results in broken Flotr2. It really bums me out to fork
libraries and remove AMD defines to make them work with AMD!
<sup>[update!](#update2)</sup>

### Handlebars plugin and the build step

Another pain point has been the [require-handlebars-plugin][]. It's really
complex to configure to work properly with the r.js builds. It requires forked
versions of Handlebars, Underscore and json2 libraries. It also forces you to
include some i18n solution which collided with ours. Not fun.  I just wanted to
use Handlebars with precompilation (In the end I ended up writing my own
Handlebars [loader plugin][requirejs-hbs]).

These are just few of the issues I've had with RequireJS. Not really anything
blocking but there is just always some annoyances especially with build the
step and it doesn't help that it doesn't give proper error messages when
something goes wrong.

## Enter Browserify V2

{% img right /images/browserify/browserify-logo.png 300 %}

I've always preferred the node.js style module syntax (`module.exports`) over
the AMD style. It's just simpler and easier to deal with. Also I haven't gotten
any real benefits from the asynchronous part of AMD. So I'm very open to
replace it with simpler synchronous requires. And now with the new version 2 of
Browserify by substack it seems to more simpler than ever to use them in the
browsers too.

So I made a list of few features I need to consider before jumping into it:

  - Debugging: I don't want to see just one big bundle in the browser
  - Using libraries with globals
  - CoffeeScript precompiling
  - Handlebars precompiling
  - Multiple versions of the same dependency

### Debugging

Well this one was easy. Just build the bundle with `--debug` flag

    $ browserify --debug main.js > bundle.js

and Browserify will inline source maps into the bundle and then just fire up
Chrome with source maps enabled from developer tools and it will display the
original files as they where separate files.

But currently this seems to work only with Chrome. In others you get just a
huge bundle of Javascript. Source maps are coming to Firefox but I wouldn't put
my hopes up for IE...

### Using libraries with globals

Lets face it. The browser world is just not going to adopt any module system
unanimously any time soon. We just have to work with libraries exposing them as
globals on the window object. I just want be able to use them without forking
them.

Browserify does somewhat decent job about this. If you require a random
Javascript file exposing globals the `require` call will return `undefined` but
after that you can just access the globals. Only requirement seems to be that
the library exposes itself explicitly to the `window` object. If it uses a
`var` statement to declare the global then you get into trouble. In Browserify
that global will be hidden inside the module closure. Also `this` seems to be
bound to some internal dependency array of Browserify so libraries exposing
global to it need some special handling too.  <sup>[update!](#update3)</sup>

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

Also in a Flotr like cases <sup>[note](#note1)</sup> where you have a library
expecting a global but you only have it as a non global module you can just put
the global back in the shim:

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

This means that if you use for example Underscore in your project root it must
be compatible with every subdependency of your dependencies to get only one
copy of Underscore to your Browserify bundle. But I do think this is a nice
feature because then you don't get into any trouble using libraries with
conflicting dependencies. You only get few more bytes. It's just something to
be aware.

## Conclusion

This journey is still on going but I think will try using Browserify in my next
project or convert some old one from RequireJS.

To conclude here's a list of pros and cons when moving from  RequireJS to
Browserify.

### Pros

  - Always bundling. No running into build problems later on.
  - Can use cool things from node.js.
  - Simpler syntax: `module.exports = ...` FTW!
  - npm at your disposal.
  - Sharing modules with node.js is no brainer
  - Source maps for CoffeeScript. Thou RequireJS will probably get those
    [soon][require-cs-issue] too.
  - The plugin API is awesome.

### Cons

  - Always bundling. Debugging old browsers can be a pain.
  - Must use a watcher tool for the builds. RequireJS can work purely in the
    browser
  - Some people might not want browser only libraries to npm. I'm not sure
    what's the node.js/npm authors' stand on this
    <sup>[update!](#update1)</sup>, but nevertheless with browserify you are
    not bound to npm. Nothing should prevent you from using CommonJS modules
    from [Bower][] for example.
  - Documentation could be better. Lots of things are assumed that you know
    already from node.js. I hope this blog post helps a little bit.
  - No community other than the node.js community. I'd like to see a mailing
    list and an IRC channel.

## Next

There are still few thing I want to investigate. If browser only modules are
ok in npm: How can I use images and CSS from a npm module? CSS could done
with a transform plugin and some runtime code which appends it to DOM, but how
to get images from it especially if I'm not using node.js as my backend?

Another interesting area to investigate would be [component][] modules. They
use the CommonJS syntax but I have no idea whether they can be used from
Browserify.

Drop a comment if you know anything about these. Thanks!

<span id="note1">
**Note**: In reality the Flotr2 distribution is unusable in Browserify too
because it contains multiple CommonJS exports in a single file which is
inherently incompatible with the CommonJS specification to start with.
</span>

<span id="update1">
**Update 1**: Browser only modules are ok in npm. See the comments.
</span>

<span id="update2">
**Update 2**: It
[appears](https://twitter.com/lmjabreu/status/315009976064155648) you can
restore the global from RequireJS too.
</span>

<span id="update3">
**Update 3**: `this` works like you would expect in node [now](https://github.com/substack/browser-pack/pull/11).
</span>


[RequireJS]: http://requirejs.org/
[Browserify]: https://github.com/substack/node-browserify
[AMD]: https://github.com/amdjs/amdjs-api/wiki/AMD
[requirejs-hbs]: https://github.com/epeli/requirejs-hbs
[UMD]: https://github.com/umdjs/umd
[require-handlebars-plugin]: https://github.com/SlexAxton/require-handlebars-plugin
[coffeeify]: https://github.com/substack/coffeeify
[npm]: https://npmjs.org/
[semver]: https://npmjs.org/package/semver
[require-cs-issue]: https://github.com/jrburke/require-cs/issues/42
[component]: https://github.com/component/component
[Bower]: http://twitter.github.com/bower/
