---
title: "#5 Word Embeddings and Swiss Army Knives - Tuesday, 4th January 2022"
layout: "daily-theme"
date: 2022-01-04T10:36:58+05:30
draft: false
summary: "What's cooler than representing words as real-valued vectors to capture its semantic meaning?"
tags: ["daily log"]
categories: ["Daily Dose of Pottekkat"]
---

{{< blockquote author="Elon Musk" link="https://www.youtube.com/watch?v=ViOdlRzq3MY" title="When asked about SpaceX" >}}
  When something is important enough, you do it even if odds are not in your favour.
{{< /blockquote >}}

I heard this quote today while I was listening to the [Lex Fridman Podcast](https://lexfridman.com/podcast/) with Elon Musk as the guest.

How powerful is that?

{{< rawhtml >}}
<iframe src="https://open.spotify.com/embed/episode/1E3ESPFzTHiAxJVXQPiRGd?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
{{< /rawhtml >}}

The entire conversation is very interesting to listen to and I would highly recommend everyone to check it out.

Listening to podcasts has been my go to companion while working out for the past year. This has reached a point where it is what motivates me the most to workout.

So, [word embeddings](https://en.wikipedia.org/wiki/Word_embedding). What's that about?

Let me ask you this.

> What's cooler than representing words as real-valued vectors to capture its semantic meaning?

I will answer this in a bit. But, to give some context, I was working on word embedding models today.

My goal was to do intent classification on a text dataset. I had some experience with word embedding models in the past but I haven't explored them deeply. Until today.

Long story short, I used [GloVe](https://en.wikipedia.org/wiki/GloVe_(machine_learning)) embedding to vectorize my text data. The GloVe model captures global statistics as well, compared to something like [Word2vec](https://en.wikipedia.org/wiki/Word2vec) which relies just on the local context information of the words.

Now, how do we "learn" from the word embeddings?

We use a deep learning model. But _which_ deep learning model?

I used a [CNN (Convolutional Neural Network)](https://en.wikipedia.org/wiki/Convolutional_neural_network) model to take these word embeddings as input. The model will classify the input to one of the eight labelled intents.

It works pretty well.

Let's go back to my question from earlier.

> What's cooler than representing words as real-valued vectors to capture its semantic meaning?

**Swiss Army Knives**.

The **Knife Theory of Hiring** says that

> When you first start a company, you need Swiss Army Knife people who can do a little bit of everything. Once your company gets big, you need a bunch of kitchen knife people who do one thing very, very well.

I came across this thanks to [Monday Musings](https://perell.com/monday-musings/) by David Perell.

I don't run a company but I think of myself as a _jack of all trades_ but a _master of none_.

I do a lot of things in my job at a startup. I write code, I manage people, I manage communities and I do project management things.

I am still technically a software engineer (not a _great_ one) but I do spend a lot of time outside this focus.

I had thought that it was a bad thing, but it comes with good benefits. Like being able to make a broader impact working on a startup.

My goal for the not so far future is to build products on my own and monetize them. I want it to be a side hustle along my full-time job. It will be small and I will be doing most (if not all) things.

So, being a utility player should help me out.

Five days into [writing daily](/categories/daily-dose-of-pottekkat/). I'm lovin it!
