---
layout: post
title: "Asynchronous module loading with Browserify"
date: 2013-03-25 01:46
comments: true
published: false
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
[module][browserify-externalize] later I happy to say it's very much possible!

<!-- more -->

Lets go through some use cases for asynchronous module loading.

## Loading shims for old browsers

This is a simple use case and it has almost nothing to do with Browserify.  For
example you are using `Array.prototype.forEach` in your app and you want to
load [es5-shim][] if the browser is missing the implementation:

```javascript entry.js

function start(){
  var main = require("./main");
  main();
}

if (Array.prototype.forEach) {
  // Just require the main function and execute
  // it if the browser has forEach implementation
  start();
}
else {
  // If not load the es5-shim with jQuery and
  // execute main after it has loaded
  $.getScript("./vendor/es5-shim.js", start);
}
```

## Lazy loading rarely used parts

Lets say your app has some graph view which requires a large graphing library
and you want to load that library and related code lazily only when the user
actually uses the feature like this:

```javascript main.js
$("button.display-graph").on("click", function(){
  $.getScript("bundle/graph.js", function(){
    var GraphView = require("./graph-view");
    var gv = new GraphView();
    gv.render();
    $(".graph-container").html(gv.el);
  });
});
```

To do this you have to remove the `./graph-view` and its dependencies from the
main app bundle. Here's where my module, [browserify-externalize][], comes to
play. You create a second Browserify bundle which is a subset of the main
bundle and use the `externalize` function to remove code from the main:

```javascript build.js
var fs = require("fs");
var browserify = require("browserify");
var externalize = require("browserify-externalize");

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

### Conditional bundle loading

We might have different bundles for different browsers. For example a bundle
with Zepto for clients implementing `document.querySelector` and a jQuery
bundle for others.

To do this we need to build simple lightweight entry point with a script loader
and two versions of the main bundle. One with Zepto and one with jQuery.

```javascript build.js

var entry = browserify("./entry");

var jquery = browserify("./main");
var zepto = browserify("./main");

// The main bundle has require calls to both jQuery and Zepto.
// So remove Zepto from the jQuery bundle:
jquery.external("./vendor/zepto");
// and jQuery from the Zepto bundle:
zepto.external("./vendor/jquery");

// Then we remove both main bundles from the entry
// bundle to make it really lightweight
externalize(entry, [jquery, zepto], function(err){
  if (err) throw err;
  entry.bundle().pipe(fs.createWriteStream("./bundle/entry.js"));
  zepto.bundle().pipe(fs.createWriteStream("./bundle/main-zepto.js"));
  jquery.bundle().pipe(fs.createWriteStream("./bundle/main-jquery.js"));
});
```

In entry.js we just detect which one we want to use and load it:

```javascript entry.js
// Since we don't have jQuery.getScript here we use an lightweight
// alternative called $script.js
var $script = require("scriptjs").$script;

// We set a global flag indicating which one we are using.
// We use this later to detect which one we can require.
window.USE_ZEPTO = !!document.querySelectorAll;

function start() {
  var main = require("./main");
  main();
}

if (window.USE_ZEPTO) $script("bundle/main-zepto.js", start);
else $script("bundle/main-jquery.js", start);
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




[Journey From RequireJS to Browserify]: http://esa-matti.suuronen.org/blog/2013/03/22/journey-from-requirejs-to-browserify/
[pr1]: https://github.com/substack/node-browserify/pull/360
[pr2]: https://github.com/substack/browser-pack/pull/9
[browserify-externalize]: https://npmjs.org/package/browserify-externalize
[es5-shim]: https://github.com/kriskowal/es5-shim

