---
layout: post
title: "Slimux - tmux Plugin for Vim"
date: 2012-04-19 19:21
comments: true
categories:
 - vim
 - tmux
---

Lately I've gotten really in to [tmux][] and I've been looking for ways to
integrate it to my Vim workflow. As result I ended up creating this Vim
plugin.

<!--more-->

If you are unfamiliar with tmux, it's best described as alternative to GNU
screen or Tiling Window Manger for console application. For fast start I can
recommend a book from The Pragmatic Bookshelf - [tmux: Productive Mouse-Free
Development](http://pragprog.com/book/bhtmux/tmux).


The plugin takes its inspiration from Emacs Slime as well as from other similar
Vim plugins.

The idea behind it is to make interaction with Read Eval Print Loops (REPL)
easier. You can select for example portion of Ruby code execute it in
Interactive Ruby (irb) with just one command. Also another goal is to make
running of build and test commands a breeze.

Usage goes like this :

  1. Create a tmux pane and start your REPL in it
  2. Select some code and hit the keyboard shortcut (you must configure this)

Slimux now prompts the pane from you:

<img src="/images/slimux/configure.png" alt="Configuring Slimux" />

Here you list of all your tmux panes. The syntax is read like this

```
[session name].[window index].[pane index]
```

Slimux will then remember that selection and won't ask it again unless you
explicitly want to reconfigure it. After that Slimux sends the code to the REPL
and executes it.

Here's an ascii.io screencast of [Slimux in use](http://ascii.io/a/409).

For detailed command and install instructions refer to project README on
Github:

[https://github.com/epeli/slimux](https://github.com/epeli/slimux)


## Wait, yet another tmux plugin?

Yes, there are quite a few tmux plugins for Vim already and this plugin got
started pretty much by accident. I started by fixing
[some](https://github.com/jpalardy/vim-slime/pull/14)
[bugs](https://github.com/jpalardy/vim-slime/pull/13) from
[vim-slime](https://github.com/jpalardy/vim-slime/pull/14). One thing I wanted
for it was an interactive prompt for tmux pane selection. Typing the target
pane manually is kinda pain. I started working on that feature on a empty
plugin and soon I realized that it was actually easier to grab features from
vim-slime to my plugin than to merge my work back to upstream. That was mainly
because vim-slime supports GNU screen which I don't care at all. Every this
heavy GNU screen user should just upgrade to tmux anyway.

Then there is [Vimux][] which on the surface seems to do every thing as Slimux,
but there where few annoyances for me. It takes too much control of tmux. It
creates the tmux pane for you where you must run your commands/REPLs. I want to
manually configure my tmux. Slimux allows you to manually select the tmux pane.
Very often I want to run the REPL or commands in whole another tmux
session so that I can put it to my second monitor. This also means that Slimux
works just fine with GVim.

Another issue is that Vimux doesn't have hooks to preprocess code by its type
before sending it to REPL. For example you have to the remove extra line breaks
from Python code to make it work with its REPL.

But do read their [introductory blog post](https://www.braintreepayments.com/braintrust/vimux-simple-vim-and-tmux-integration). Good stuff anyways.

Also I just kinda wanted learn some Vim Scripting and this is my first proper
Vim plugin I've written. Feedback is really appreciated.


[tmux]: http://tmux.sourceforge.net/
[Vimux]: https://github.com/benmills/vimux

