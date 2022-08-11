---
title: "#180 Moving to Netlify - Thursday, 11th August 2022"
layout: "daily-theme"
date: 2022-08-11T19:13:00+05:30
draft: false
summary: "I moved my Hugo blog from GitHub pages to Netlify."
tags: ["daily log"]
categories: ["Daily Dose of Pottekkat"]
---

I was working on a new blog post. I wanted to publish it on my own blog first. But, it did not have a draft preview feature. I could set one up, but with my site being static, there are fewer options to receive feedback from reviewers.

I could set up a deploy preview for pull requests. So, pull requests to my main branch would trigger a build, and it will deploy my site. It will show the end result, and reviewers aren't forced to stare at the markdown and figure out what the end result would look like. It would also make it easy to send the draft for review to non-tech people (people who don't use GitHub).

But with my current setup, i.e., deploying on GitHub pages, there wasn't a way I could achieve this. So, naturally, I stopped using GitHub pages and moved to Netlify.

It only took me a little more than an hour to set everything up and test it out. And right out of the gate, I'm impressed. It works like a charm with a relatively minimal setup.

The deploy preview looks good, I have a fast site, and I can finally set up server-side redirects. Server-side redirects are especially significant since I have been hacking with Jekyll redirects. With Netlify, my external redirect links are cleaner and give a proper 301 status code.

I haven't made a significant change to my blog in forever. This was quite fun, and I will write about it. Hopefully, this also pushes me to write more blog posts!
