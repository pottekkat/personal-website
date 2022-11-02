---
title: "A Quick Start Guide for Mastodon"
date: 2022-11-02T14:02:10+05:30
draft: false
weight: 10
ShowToc: true
TocOpen: true
summary: "Learn to get up and running with the microblogging platform everyone is talking about."
tags: ["tutorials", "mastodon"]
categories: ["Tutorials"]
cover:
    image: "/images/mastodon-quick-start-guide/rocket-banner.jpeg"
    alt: "A photo of a rocket taking off with a space shuttle."
    caption: "Photo by [Pixabay](https://www.pexels.com/photo/flight-sky-earth-space-2166/)"
    relative: false
---

I, like many others, [recently started using Mastodon](https://fosstodon.org/@sudo_navendu).

It was confusing initially, but a little exploration helped me find my bearings.

This article gives you a quick guide on how to get started with the platform.

## What is Mastodon?

[Mastodon](https://joinmastodon.org/) is an open source, decentralized, microblogging platform that could be a viable alternative to Twitter.

Instead of a central company (or an eccentric tech billionaire) managing the platform, Mastodon consists of multiple independent instances. Anyone can host their own instance of Mastodon and run it any way they want. The [source code](https://github.com/mastodon/mastodon) of Mastodon is public and maintained by open source contributors.

As a user, you don't need to host your own instance. You can join any [existing ones](https://joinmastodon.org/servers) according to your niche of interest. You will still be able to follow and see posts from people on different instances ([see below](#)).

{{< figure src="/images/mastodon-quick-start-guide/mastodon-servers.png#center" title="General and niche servers" caption="See [joinmastodon.org/servers](https://joinmastodon.org/servers)" link="/images/mastodon-quick-start-guide/mastodon-servers.png" target="_blank" class="align-center" >}}

Most Mastodon servers run on donations and are not looking to make money. So, you won't see ads or sponsored posts like on other social media.

## Signing Up

You can sign up using your email on any of the [available servers](https://joinmastodon.org/servers). You can pick your niche or go to more general servers like [mastodon.online](https://mastodon.online).

{{< figure src="/images/mastodon-quick-start-guide/sign-up.png#center" title="Using your email to sign up" caption="I signed up on the [fosstodon.org](https://fosstodon.org) server" link="/images/mastodon-quick-start-guide/sign-up.png" target="_blank" class="align-center" >}}

Once you fill in your details, you will receive a confirmation email with an activation link. Click on it, and you are ready to go.

> **Note**: A Mastodon username would be in the form `@user@instance.name`. For example, my username is [sudo_navendu@fosstodon.org](https://fosstodon.org/@sudo_navendu).

## Navigating the UI

Once you log in, a welcome wizard will walk you through the UI.

{{< figure src="/images/mastodon-quick-start-guide/homepage.png#center" title="Homepage of the Fosstodon server" caption="The UI is pretty intuitive especially if you are a Twitter user" link="/images/mastodon-quick-start-guide/homepage.png" target="_blank" class="align-center" >}}

You can edit your profile and make it more personal by adding:

1. A bio
2. An avatar and a header image

   {{< figure src="/images/mastodon-quick-start-guide/edit-profile.png#center" title="Adding a bio and images" caption="A profile without a bio or avatar might been seen as fishy" link="/images/mastodon-quick-start-guide/edit-profile.png" target="_blank" class="align-center" >}}

3. Profile metadata
   
   {{< figure src="/images/mastodon-quick-start-guide/profile-metadata.png#center" title="Adding profile metadata" caption="You can add links to your other social accounts or websites" link="/images/mastodon-quick-start-guide/profile-metadata.png" target="_blank" class="align-center" >}}

In Mastodon, posts (tweets) are called Toots. You can favorite and boost a Toot like how you heart and retweet on Twitter.

{{< figure src="/images/mastodon-quick-start-guide/anatomy-of-a-toot.png#center" title="The anatomy of a toot" caption="You can reply to the Toot, boost it, add it to your favorites, or bookmark it" link="/images/mastodon-quick-start-guide/anatomy-of-a-toot.png" target="_blank" class="align-center" >}}

## Home, Local, and Federated Timelines

Unlike platforms like Twitter with a single timeline, Mastodon has three timelines serving different content:

1. **Home**: This is similar to your Twitter timeline. It contains all the Toots from people you follow across all Mastodon instances (the Fediverse).
2. **Local**: This contains all the public Toots from your instance. Even if you don't follow someone, you will find their public Toots here. You can use it to discover people in your niche.
3. **Federated**: This timeline contains all public Toots from all the instances your server is _federated_ with. The best analogy to understand this is email. There are multiple email providers, and you can create an email on any of them. But you can still send and receive emails across email providers if you have their address. Similarly, the federated timeline shows Toots from instances other that your server.

{{< figure src="/images/mastodon-quick-start-guide/timelines.png#center" title="Timelines" caption="These timelines seem pretty useful in discovering people" link="/images/mastodon-quick-start-guide/timelines.png" target="_blank" class="align-center" >}}

These timelines are chronological, and there is no fancy algorithm trying to keep you engaged.

## Mastodon Client Apps

Mastodon has an official app for [Android](https://play.google.com/store/apps/details?id=org.joinmastodon.android) and [iOS](https://apps.apple.com/us/app/mastodon-for-iphone/id1571998974) devices. Since Mastodon is open source and has a [public API](https://docs.joinmastodon.org/client/intro/), many [third-party apps](https://joinmastodon.org/apps) are also available.

{{< figure src="/images/mastodon-quick-start-guide/third-party-apps.png#center" title="Available third-party apps" caption="I have only used the web app till now. I will try out these apps and leave a review if you are interested" link="/images/mastodon-quick-start-guide/third-party-apps.png" target="_blank" class="align-center" >}}

## Wrap Up

That's it for the quick start guide. You should be able to pick more things up as you use Mastodon. You can also refer the [documentation](https://docs.joinmastodon.org/) to learn more.
