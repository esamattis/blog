---
layout: post
title: "Rendering Backbone Views without rendering"
date: 2012-05-28 22:56
comments: true
categories:
 - programming
 - javascript
 - backbone
---

For a long client-side templating languages has somewhat bothered me. Since
they all take strings as input and re-renders those to DOM elements on every
small change you want to make. That has always sounded bit silly to me.  Why
not just create the DOM tree once and then just manipulate the bits you want to
be changed?

<!--more-->

Well in practice that's lots of work even with help of jQuery. Surprisingly it
appears that templating languages are not invented without a reason. Although
there are several templating languages that are made for DOM only manipulation,
but for reason or another I haven't liked any of them until I was told to try
[Transparency][] made by [Jarno Keskikangas][pyykkis] on the Finnish Javascript
channel `#javascript.fi` on IRCnet.

It gives a simple semantic data binding API which makes it easy to do similar
transformations to DOM as you would do with regular templating languages like
collection rendering, but without actually rendering any strings to DOM
elements or cluttering them with some micro programming language. Transparency
templates are just HTML and nothing more. The logic stays in the Javascript
code.


## Using with Backbone.js

Since it not directly obvious how use it with Backbone and similar client-side
frameworks efficiently I'll give a simple example here.

First you must have some base DOM elements which can be used as templates:

```html
<div id="templates">

<div class="data">

    <h2>Data View</h2>
    <span class="name"></span>:
    <span class="x"></span>,
    <span class="y"></span>

</div>

</div>
```

These can be anywhere in the DOM. Just add some CSS to hide it:

```css
#templates {
  display: none;
}
```

Next we will create a simple Backbone View which will demonstrate Transparency
usage with Backbone. It just displays a name and some random values.

```javascript
var DataViewer = Backbone.View.extend({

  // Cache the template selector for all DataViewer Views.
  baseEl: $("#templates .data"),

  constructor: function() {
    Backbone.View.prototype.constructor.apply(this, arguments);

    // Get View element for this view instance just by cloning
    // the object from the DOM.
    this.setElement(this.baseEl.clone());

    // Render on every model change.
    this.model.on("change", this.render, this);
  },

  render: function() {
    // Let Transparency to render the model data. This is very
    // efficient since it does not create new elements (except when
    // looping collections), but just fills the existing DOM with
    // given data.
    Transparency.render(this.el, this.model.toJSON());
  }

});
```

Note how Javascripty this is. The view element is got just by copying the
existing DOM objects like you would do with normal Javascript objects. You
copy an object and then extend it. You could do even some template inheritance
with this.

The view is used like any other Backbone View:

```javascript
var model = new Backbone.Model({ name: "Mouse Position" });
var mousePosition = new DataViewer({ model: model });

// Put it to the DOM
mousePosition.render();
$("#content").append(mousePosition.el);

// Put some random data to our model
$(document).mousemove(function(e){
    model.set({ x: e.pageX, y: e.pageY });
});
```

With Transparency there is one feature or gotha you must be aware of. The state
of the `view.el` element is not completely reseted between render calls. This
can be an advantage in some situations. For example you could do some
additional manipulation with jQuery to it which is not lost between render
calls. But if you need to reset it you can just reclone the base element again.

Here's a fully working [fiddle](http://jsfiddle.net/DBq9v/1/) of this example
for you to play with.

This sounds very promising to me and I'm going to try it in some project when I
get the chance.

[Transparency]: http://leonidas.github.com/transparency/
[pyykkis]: https://github.com/pyykkis
[Transparency Wiki]: https://github.com/leonidas/transparency/wiki/Defining-template-engine-performance

