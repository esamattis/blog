---
layout: post
title: "Asynchronous module loading with Browserify"
date: 2013-03-25 01:46
comments: true
categories:
  - web
  - node.js
  - browserify
---

This is a sequel for the [Journey From RequireJS to Browserify][] post.

After publishing the previous post I got a lot of feedback saying that
Browserify can't do asynchronous module loading. While it's true that
Browserify doesn't do it for you it doesn't mean that you cannot do
asynchronous module loading **with** Browserify. This is very intentional
decision in Browserify. It is supposed to be just a simple tool for bundling
CommonJS/node.js modules for the browser and nothing more. There are other
tools which can be used with Browserify to implement asynchronous module
loading.


<!-- more -->

This is pretty common misconception or even attitude with other unopinionated
tools also. When I tell people that I'm using [Backbone][] for my frontend apps
they often ask how can I use it because it doesn't do data binding, nested
views or something else which is available in some huge framework they are
using. But this is a feature! And so it is with Browserify too. It doesn't mean
that I can't do [those][rivetsjs] [things][viewmaster] with Backbone.


Lets go through some use cases for asynchronous module loading.

## Loading shims for old browsers

todo

## Lazy loading rarely used parts of the app

Like admin tools which are not available for the casual user.

todo

### Conditional bundle loading

I might have different builds for different browsers. For example a build with
Zepto for clients implementing `document.querySelector` and a jQuery build for
others.

With this setup I need three different bundles:

  - `bundle/index.js`
  - `bundle/main-zepto.js`
  - `bundle/main-jquery.js`

Where `bundle/index.js` is very lightweight file with only a script loader and
logic to decide whether to use Zepto or jQuery. The main bundles
`bundle/main-zepto.js` and `bundle/main-jquery.js` are copies of the full
application with a difference being that other comes with Zepto and other
with jQuery.

`index.js`:

```javascript

// Load lightweight script loader
var loadScript = require("./load_script");

// If browser has querySelectorAll we can use just Zepto because Zepto builds
// on top if
var useZepto = !!document.querySelectorAll;

// Using this we can decide which bundle to load.
if (useZepto) loadScript("bundle/main-zepto.js", start);
else loadScript("bundle/main-jquery.js", start);

function start(err){
  // Crash if bundle loading failed
  if (err) throw err;

  // Now this is the important part. Using the useZepto we can detect in which
  // bundle we are actually on. In zepto bundle we can only require Zepto and
  // in jQuery bundle we can require only jQuery. In reality we would want to
  // move this if-statement to a module where we can just do:
  // var $ = require("./zepto_or_jquery");
  if (useZepto) var $ = require("./zepto");
  else var $ = require("./jquery");

  // Something Backbonenish that must be added to the dom
  var MainView = require("./main");
  var main = new MainView();
  main.render()
  $("body").html(main.el);

}

```

So how do we build these two different bundles?

First we need to build index.js bundle with everything else factored out except
`./load_script`.

```
browserify \
  --external ./zeptop.js
  --external ./jquery.js
  --external ./main.js > bundle/index.js
```

Then we just build two different bundles of `main.js` with jQuery or Zepto left
out:


```
browserify --require --external ./zeptop.js > bundle/main-jquery.js
browserify --require --external ./jquery.js > bundle/main-zeptop.js
```




[Journey From RequireJS to Browserify]: http://esa-matti.suuronen.org/blog/2013/03/22/journey-from-requirejs-to-browserify/
[Backbone]: http://backbonejs.org/
[rivetsjs]: http://rivetsjs.com/
[viewmaster]: http://epeli.github.com/backbone.viewmaster/
