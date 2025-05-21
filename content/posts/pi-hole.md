---
title: I Pi-holed My Whole Network
slug: pi-hole
date: 2025-05-21T11:31:00+05:30
draft: false
toc:
  show: false
ShowRelatedContent: false
description: Setting up Pi-hole on a Raspberry Pi for DNS-level ad blocking on my home WiFi network.
summary: It was much cheaper and easier than convincing my family to use ad blockers. And it turns out, a quarter of all DNS queries were ads.
tags:
  - raspberry pi
  - spam
  - monitoring
categories:
  - Raspberry Pi
series: []
aliases: []
cover:
  image: /images/pi-hole/raspberry-banner.jpg
  alt: Photo of raspberries.
  caption: What do you mean you like ads?!
  relative: false
fmContentType: Post (default)
---

I have been using ad blockers for at least a decade. While the early ads were probably harmless, their slow creep into every corner of the internet and people's lives concerns me from behind the comforts of my ad-free browser.

I was made aware of this intrusive advertisement proliferation by my family, whose idea of the internet is confined to three social media apps (and whatever links to news websites shared in these apps). They jokingly shared seeing hyper-targeted ads whenever they open up <insert a normie social media app here> like it was common, while I have been blissfully oblivious.

But now, I'm catching these second-hand ads too.

Convincing them to ditch their phone, or at least the apps, and use a browser was a futile exercise. For context, I couldn't even stop them from giving away their credit card details on random websites without a second thought.

Left with no other options and these ads slowly leaking towards me, I decided to set up [Pi-hole](https://pi-hole.net/) on our WiFi so everyone connected to the network would get ad blocking by default.

Pi-hole is a [DNS sinkhole](https://en.wikipedia.org/wiki/DNS_Sinkhole) that can run on a tiny computer connected to your local network. It blocks ads and trackers at the DNS level, even before they reach the browser, so you can block them not just on websites but also in mobile apps, smart TVs, and anything else connected to your network. No extensions or device-specific setup.

In a past life, I was more into analog electronics than programming. I had a [Raspberry Pi 2B](https://www.raspberrypi.com/products/raspberry-pi-2-model-b/) lying around from those days, unused, making it the perfect candidate for this project.

My ISP-issued router (it was free, don't judge) supports custom DNS settings, so I didn't have to replace any hardware. That was a relief (because it did not cost me anything).

I found:

- an old Ethernet cable
- a power brick (you should ALWAYS save ALL your cables)
- and a blank SD card

_At last, the hoarder genes come in handy._

I went with [Raspbian](https://www.raspberrypi.com/software/) (or Raspberry Pi OS, as they call it now). Pi-hole [supports it](https://docs.pi-hole.net/main/prerequisites/#supported-operating-systems) out of the box, along with other major Linux distributions, so you're probably fine with whatever OS you are comfortable with.

Once the Pi was up and running, installing Pi-hole was trivial. The [one-step automated install](https://github.com/pi-hole/pi-hole/#one-step-automated-install) method worked flawlessly:

```shell
curl -sSL https://install.pi-hole.net | bash
```

The installer walks you through pretty much everything and tells you exactly what to do next, which is neat.

With Pi-hole installed and running, I logged into my router's admin interface and updated the DNS settings. On my **Airtel RL841GWV-DGB** router, this was under **Network -> LAN -> Manual DNS**. I entered the IP address of the Raspberry Pi so the router would forward all DNS queries to Pi-hole.

Now, every device connected to the WiFi will benefit from DNS-level ad blocking thanks to Pi-hole. I also added a local DNS record that points `pi.myhousename.com` to the Pi's IP address so that the Pi-hole dashboard can be easily accessed from any device on the network.

Pi-hole comes with a default blocklist added during installation. But you can easily find more prebuilt lists from the Pi-hole community. I have added the [hagezi/dns-blocklists#pro](https://github.com/hagezi/dns-blocklists#pro) list, which covers pretty much everything. I also added [anudeepND/whitelist](https://github.com/anudeepND/whitelist) as an allowlist to prevent blocking legit websites that are often falsely blocked.

Once everything was set up and tested, I called the family, who were just recovering from a brief internet blackout, to deliver the good news:

> **Me**: You won't see ads anymore.
>
> **Fam**: Wait... so no more YouTube ads?
>
> **Me**: Not really. You can't block YouTube ads without breaking YouTube, but most other ads will be gone. And most trackers, too.

They were unimpressed. Nobody cared about the ads. But at least, I wouldn't be exposed to second-hand ad targeting anymore, which I'm counting as a win.

It has been almost a week since I set this up, and so far, the stats show that **24.8% of all queries were blocked**, which is a lot. I haven't noticed much difference, probably because I already use a browser-based ad blocker. But I wonder if others are noticing any changes.

Maybe ads have become so well-blended into the experience that they are indistinguishable from the content itself, so much so that we don't even notice when they disappear.

Anyway, regardless of how unappreciative my family is, I think blocking ads is a statement. It's a way of pushing back against the relentless effort by digital monopolies to turn us into passive consumers inside their walled gardens.

I've also been meaning to get into self-hosting and homelabbing for a while now, and setting up Pi-hole felt like a solid first step. I have a few more Raspberry Pis lying around and a bookmarks folder full of ideas.

_Is this the start of a crippling addiction?_
