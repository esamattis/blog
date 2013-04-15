---
layout: post
title: "Asynchronous module loading with Browserify"
date: 2013-04-15 10:00
comments: true
categories:
  - web
  - node.js
  - browserify
---

This is a sequel for the [Journey From RequireJS to Browserify][] post.

After publishing the previous post I got a lot of feedback saying that
Browserify can't do asynchronous module loading. Since that's something I'd
like to have with Browserify too I started looking on how to do it and after
couple of [pull][pr1] [requests][pr2] and one published npm
[module][externalize] later I'm happy to say it's very much possible now!

<!-- more -->

## Background

Basically asynchronous module loading can be done just by creating multiple
bundles with Browserify and loading them with a script loader of your choosing.
There is one in [jQuery][getscript] or if you don't like jQuery there
[are][$script.js] [quite][yepnope] [a][head.js] [few][lab.js]
[standalone][lazyload] [ones][basket.js] [out][modern] there.


## Loading shims for old browsers

This is a simple use case and it has almost nothing to do with Browserify. For
example if we are using `Function.prototype.bind` in our app and we want to
load [es5-shim][] if the browser is missing the implementation:

```javascript index.js

if (Function.prototype.bind) {
  // Just require the main module if the browser
  // has Function.prototype.bind implementation
  require("./main");
}
else {
  // If not load the es5-shim with a script loader and
  // require main after it has loaded
  jQuery.getScript("./vendor/es5-shim.js", function(){
    require("./main");
  });
}
```

## Conditional bundle loading

We might have different bundles for different browsers. For example a bundle
with Zepto for clients implementing `document.querySelector` and a jQuery
bundle for others.

To do this we need to build simple lightweight entry point with a script loader
and two versions of the main bundle. One with Zepto and one with jQuery.

```javascript build.js
var browserify = require("browserify");

var index = browserify("./index");
var jquery = browserify("./main");
var zepto = browserify("./main");

// The main bundle has require calls to both jQuery and Zepto.
// So remove Zepto from the jQuery bundle:
jquery.external("./vendor/zepto");
// and jQuery from the Zepto bundle:
zepto.external("./vendor/jquery");

index.bundle().pipe(fs.createWriteStream("./bundle/index.js"));
zepto.bundle().pipe(fs.createWriteStream("./bundle/main-zepto.js"));
jquery.bundle().pipe(fs.createWriteStream("./bundle/main-jquery.js"));
```

In index.js we just detect which one we want to use and load it:

```javascript index.js
// Since we don't have jQuery.getScript here we use an
// lightweight alternative called $script.js. npm: scriptjs
var $script = require("scriptjs").$script;

// We set a global flag indicating which one we are using.
// We use this later to detect which one we can require.
window.USE_ZEPTO = !!document.querySelectorAll;

// The both main bundles have an entry points (main.js) so we
// only need to load them and the code will be executed soon
// as it is added to the DOM
if (window.USE_ZEPTO) $script("bundle/main-zepto.js");
else $script("bundle/main-jquery.js");
```

In our app code we need to abstract the require calls to jQuery and Zepto to
make  it smooth:

```javascript jquery-or-zepto.js
// Neither one, jQuery or Zepto, does CommonJS exports
// so grab them from the globals after requiring
if (window.USE_ZEPTO) {
  require("./vendor/zepto");
  module.exports = window.Zepto;
}
else {
  require("./vendor/jquery");
  module.exports = window.jQuery;
}
```

And in app code just use `var $ = require("./jquery-or-zepto");` to get the
correct one depending on the bundle we loaded.

## Lazy loading rarely used parts

Now this is where things get really interesting.

Lets say our app has some graph view which requires a large graphing library
and we want to load that library and related code lazily only when the user
actually uses the feature like this:

```javascript main.js
$("button.display-graph").on("click", function(){
  jQuery.getScript("bundle/graph.js", function(){
    var GraphView = require("./graph-view");
    var view = new GraphView();
    view.render();
    $(".graph-container").html(view.el);
  });
});
```

To do this we have to remove the `./graph-view` and its dependencies from the
main bundle. Here's where my module, [externalize][], comes to help.
We create a second Browserify bundle which is a subset of the main bundle and
use the `externalize` function to remove code from the main:

```javascript build.js
var fs = require("fs");
var browserify = require("browserify");
var externalize = require("externalize");

// Main bundle has main.js as the entry point
var main = browserify("./main");

// Graph bundle does not have an entry point, but it has
// `./graph-view` as requireable module
var graph = browserify().require("./graph-view");

// Use externalize to remove graph bundle code from the main
externalize(main, graph, function(err){
  if (err) throw err;
  // After externalizing the bundles can be written to files
  main.bundle().pipe(fs.createWriteStream("./bundle/main.js"));
  graph.bundle().pipe(fs.createWriteStream("./bundle/graph.js"));
});

```

Now just include `./bundle/main.js` to the page and `./bundle/graph.js` will
be loaded lazily when needed.

Checkout the externalize [readme][] file for more information.

## Putting it all together

I've uploaded a more real worldish example on [github pages][carcounter] using
the techniques presented here. It will also serve as a decent Backbone.js and
Handlebars example with Browserify.  It's heavily commented so it should be
easy to follow even if you don't know/care anything about Backbone or
Handlebars.

[{% img /images/carcounter.png %}][carcounter]

Open up devtools from your browser and look at the network tab to see what
happens when you hit to "Toggle graph" button for the first time.

I encourage you to read the source code of the example in following order:

  1. [build.js](https://github.com/epeli/carcounter/blob/master/build.js)
    - Build script for the bundles
  1. [index.js](https://github.com/epeli/carcounter/blob/master/client/index.js)
    - This is the first thing executed on the page
    - It determines whether to load jQuery or the Zepto version of the main bundle
      and whether to load the shims
  1. [main.js](https://github.com/epeli/carcounter/blob/master/client/main.js)
    - The actual application code starts here
    - It lazy loads the graph code on first time it is used
  1. [Compiled bundles](https://github.com/epeli/carcounter/tree/master/bundle)
    - Take a look at their sizes and skim through what they contain

## Before going crazy with it

Before slicing up your Browserify bundles you should really sit down and think
through whether this is really required for your app. For example if you add a
largish image to your app it might easily dissolve all the benefits you gained
by slicing the bundles. Even a single 100kb image will translate to a quite big
chunk of minified and gzipped Javascript code. And because this can get very
complex if you go crazy with it you should make sure it is worth it.

Happy hacking!

[Journey From RequireJS to Browserify]: http://esa-matti.suuronen.org/blog/2013/03/22/journey-from-requirejs-to-browserify/
[pr1]: https://github.com/substack/node-browserify/pull/360
[pr2]: https://github.com/substack/browser-pack/pull/9
[externalize]: https://github.com/epeli/browserify-externalize
[es5-shim]: https://github.com/kriskowal/es5-shim
[carcounter]: http://epeli.github.io/carcounter/
[carcounter-src]: https://github.com/epeli/carcounter
[readme]: https://github.com/epeli/browserify-externalize#readme

[getscript]: http://api.jquery.com/jQuery.getScript/
[$script.js]: https://npmjs.org/package/scriptjs
[yepnope]: http://yepnopejs.com/
[lab.js]: http://labjs.com/
[lazyload]: https://github.com/rgrove/lazyload/
[head.js]: http://headjs.com/
[basket.js]: http://addyosmani.github.io/basket.js/
[modern]: https://gist.github.com/epeli/5384178

