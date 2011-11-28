---
layout: post
title: "How to Write CoffeeScript Efficiently"
date: 2011-11-28 20:07
comments: true
categories:
 - coffeescript
 - programming
---

I have found few tricks that makes writing CoffeeScript more efficient and fun,
especially when learning it and I'd like to share it with you.

These tricks are for Vim, but the ideas can be carried out to other editors as
well. I know that at least the TextMate CoffeeScript Bundle can do some of
these.

## Basics

Let's get the basics out of way. Get syntax hilighting from
[vim-coffee-script](https://github.com/kchmck/vim-coffee-script) plugin
and automatic syntax checking from
[Syntastic](http://www.vim.org/scripts/script.php?script_id=2736). These will
take you a long way, but with CoffeeScript we can do more.

## Reading compiled code

Especially when starting out with CoffeeScript you are not always sure what the
snippet you are reading or even the code you just wrote does.  Chances are that
you already know Javascript so we can use that to our advantage.
`vim-coffee-script` makes that incredibly easy.

Lets take following snippet that might be confusing to CoffeeScript newbies:

```coffeescript
{@foo} = bar
```

With `vim-coffee-script` you can just select the snippet in Visual Mode and type
`:CoffeeCompile` which will open up a new scratch buffer with a compiled
version of the snippet which will clearly tell what this syntax in CoffeeScript
means. You can use this to verify that you understood the CoffeeScript syntax
by using your Javascript knowledge!

I recommend creating a shortcut for this. It's so useful. Put this to your
`.vimrc`:

```
vmap <leader>c <esc>:'<,'>:CoffeeCompile<CR>
map <leader>c :CoffeeCompile<CR>
```

This allows you to invoke the compiler with `Leader-key + c`. The leader key is
backslash by default, but usually it is redefined to comma.


## Stack Traces

I don't like manually compiling CoffeeScript files for my Node.js apps. Instead
I use the `coffee` command directly or use plain js wrapper app that starts my
CoffeeScript apps. This is clean and simple, but can be painful when you get an
exception. There is a stack trace, but it refers to the compiled Javacript file
which does not exist!  You could look up the original CoffeeScript file and try
to guess what line the stack trace means by looking variable names or manually
compile the file when exception occurs. Not so fun.


`vim-coffee-script` to the rescue!


When you execute the `CoffeeCompile` Vim command in Command Mode you will get
the whole file compiled into the scracth buffer. In that you can scroll the
line referred by the stack trace and see what code exactly rose it.  This is
bit clumsy since normally you can jump to a certain line by typing `:<number>`.
We can do better! Put this to `.vimrc`:

```
command -nargs=1 C CoffeeCompile | :<args>
```

And then try typing `:C<number>`. Whoah! This takes you to the given line
number in the compiled Javascript of the CoffeeScript file you are editing.
Using it is just one character longer than normally jumping lines!
