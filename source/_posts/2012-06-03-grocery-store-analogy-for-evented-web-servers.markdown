---
layout: post
title: "Grocery Store Analogy for Evented Web Servers"
date: 2012-06-03 18:33
comments: true
categories:
 - node.js
 - web servers
---

Today I was trying to explain the differences between threaded and evented web
servers to a friend on a high level. Usually the threaded model is explained
with a grocery store analogy and I started to wonder how that analogy could be
extended to explain the evented model too.

<!--more-->

## Threaded model

Lets revise the grocery store analogy for the threaded web servers first.
Grocery store is the web server, cashiers are the threads and customers are the
incoming requests.

During a late afternoon when everybody is leaving work and going for grocery
shopping the store will be filled with customers. For the store to work
properly the store owner has to hire multiple cashiers to cash the customers
concurrently in order to keep them from waiting in long lines. Web servers
spawn multiple threads to serve requests concurrently to keep users from
waiting pages to load. Hiring cashiers cost money as spawning threads cost
memory and CPU cycles.

## Evented model

In the evented model the web server has only a single thread. How a store with
single cashier could function in a rush hour?

The cashiers use most of the their time scanning bar codes as threads use most
of the their time waiting for I/O in threaded web servers. In some modern
stores the customers scan the products themselves while picking them to their
baskets. This means that there is no limit how many products can be scanned
concurrently. Same goes for evented web servers. The thread is not waiting for
any I/O. It just does the real computing work as the cashier does only cashing
of the customers. This is very efficient.

This is of course has some drawbacks. A single troublesome customer can block
the entire checkout line for all the customers. This is true for evented web
servers too. It will go to bankruptcy if [Mr. Fibonacci] is let in to the store
to occupy the only cashier with long computations. The single thread cannot
respond to any other requests if it is busy computing something.

Luckily this is not usually the case with web servers and if the web
application really needs to do some intensive computations the work must be
handed to some other worker process. This way the thread can keep responding to
the requests in a timely fashion. Like in the store, the cashier cannot go of
doing something else for long periods of time without creating long lines. He
will need someone to help on those tasks.

Evented systems can be more efficient, but you have to take greater care of
what you let run in it.

### Conlusion

While this is not a perfect analogy, but I do like how this explains some of
the drawbacks too. Some evented systems (read Node.js) get way too much hype
for just being fast without considering the gotchas and the real benefits
they bring in, but that's a whole another blog post.

I hope this helps some others to grasp the evented model too.

[Mr. Fibonacci]: http://teddziuba.com/2011/10/node-js-is-cancer.html
