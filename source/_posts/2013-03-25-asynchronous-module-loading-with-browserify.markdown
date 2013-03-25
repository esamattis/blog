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

This is pretty common misconception with other unopinionated tools also. When I
tell people that I'm using [Backbone][] for my frontend apps they often ask how
can I use it because it doesn't do data binding, nested views or something else
which is available in some huge framework they are using. But this is a
feature! And so it is with Browserify too. It doesn't mean that I can't do
[those][rivetsjs] [things][viewmaster] with Backbone.

## Types of asynchronous module loading

Lets define some use cases for asynchronous module loading.

  - Loading shims for old browsers
  - Conditional bundle loading. I might have different builds for different
    browsers. For example a build with Zepto for clients implementing
    `document.querySelector` and a jQuery build for others.
  - Lazy loading rarely used parts of the app. Like admin tools which are not
    available for the casual user




[Journey From RequireJS to Browserify]: http://esa-matti.suuronen.org/blog/2013/03/22/journey-from-requirejs-to-browserify/
[Backbone]: http://backbonejs.org/
[rivetsjs]: http://rivetsjs.com/
[viewmaster]: http://epeli.github.com/backbone.viewmaster/
