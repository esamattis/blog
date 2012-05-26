---
layout: post
title: "Python-like Decorators in CoffeeScript"
date: 2011-10-06 21:10
comments: true
categories:
 - python
 - coffeescript
 - javascript
 - programming
---


If you are not familar what decorators are in Python you should skim through
[this](http://docs.python.org/glossary.html#term-decorator) and
[this](http://www.ibm.com/developerworks/linux/library/l-cpdecor/index.html).
In short they are a nice syntax for wrapping functions/methods with other
functions in Python.

I really like decorators in Python and I sometimes miss them when working in
other languages. Today at work it hit me when I was working on CoffeeScript
project. It is really easy to implement Python-like decorators cleanly in
CoffeeScript.

## Decorators in Python

Here's an example usage of Python decorator. Let's pretend that this is a
class for reading values from some device. It will give us values between 0 and
100, but in this app we want put a roof for the values it gives. We can create
a decorator that limits the values given by the getter.

{% include_code Decorator in Python  decorator_example.py %}

## Decorators in CoffeeScript

So that was an advanced configurable decorator for Python. Lets see how
CoffeeScript handles the same situation.


{%  include_code Decorator in CoffeeScript [lang:coffeescript] decorator_example.coffee %}

Wow! That is a lot less syntax and no extra nesting!

This really shows how powerful anonymous functions and implicit returns are in
CoffeeScript.  Also the usage syntax would not be so clean if CoffeeScript
didn't have ability to call functions without the parenthesis.

The usage syntax is though better in Python, because you can stack decorators
cleanly with it.

``` python Stacking decorators in Python
class Device(object):
    @roof(50)
    @floor(10) # Checks the bottom of the value
    def get_value(self):
        return random.randint(0, 100)
```


In CoffeeScript must put them after each others which can get nasty if you have
many decorators.


``` coffeescript Piping decorators in CoffeeScript
class Device
    getValue: roof(50) floor(10) ->
      parseInt Math.random() * 100
```

But wait! There were no specific decorator syntax in Python in the old days.
One could apply decorators just by calling it to the target and replacing the
original method.


``` python Oldschool decorator usage
class Device(object):
    def get_value(self):
        return random.randint(0, 100)

    get_value = roof(50)(get_value)
    get_value = floor(10)(get_value)
```

So you can do this in CoffeeScript

``` coffeescript Piping decorators in CoffeeScript
class Device
  getValue: roof(50) ->
    parseInt Math.random() * 100

  getValue: roof(50) Device::getValue
  getValue: floor(10) Device::getValue

```

Pretty ugly, yeah, but might be better if you have tons of decorators.






