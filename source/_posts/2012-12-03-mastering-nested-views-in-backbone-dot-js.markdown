---
layout: post
title: "Mastering nested views in Backbone.js"
date: 2012-12-03 22:25
comments: true
categories:
  - Backbone.js
  - Javascript
  - HTML5
---

During the last year or so I have been building quite a few apps on top of
Backbone.js. The reason for choosing Backbone.js was the fact it's fairly low
level. It does not get in my way when I want to integrate some random crappy
jQuery plugings or swap Ajax backend to Websockets in to my apps etc. Also it
doesn't isolate me to inside some framework wonderland jail. I really had to
learn how to work with the DOM and how to arrange my code. This is good in the
since it has given me good foundations how things generally work if I ever want
to venture into some other frameworks.

But there is a downside to all this low levelness. With certain aspects you are
really left alone by the framework. For me the hardest part was how to handle
nested views.

<!-- more -->

## Backbone.ViewMaster

I think I've found some good patterns on how to handle them. Originally I
wanted to just write a blog post about them, but more I looked my code I
realized it would be better as a library, because they were not that trivial in
the end.

This not by any means unique. There are several libraries that can help you
with nested views. I would guess the most notable ones are
backbone.layoutmanager and Marionette.js. But I wanted something simpler. So
here's Backbone.ViewMaster:

<http://epeli.github.com/backbone.viewmaster/>

It just a single Backbone.js View which can be used as the base view when
building Backbone.js apps. It tries to be more than just a library as it
encourages on writing decoupled reusable views. Read the tutorial to get gist
of it.


