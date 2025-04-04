---
title: Git for Vibe Coders and Non-Programmers
slug: git-for-vibe-coders
date: 2025-04-14T09:28:09+05:30
draft: false
toc:
    show: false
ShowRelatedContent: false
description: A practical + interactive crash course on Git (that slaps).
summary: A practical, hands-on, and interactive guide to Git for new coders and creative builders.
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
mermaid: true
tags:
    - interactive
    - software engineering
    - tutorials
    - tips
categories:
    - Tutorials
series: []
aliases: []
cover:
    image: /images/git-for-vibe-coders/git-banner.jpg
    alt: Photo showing a Git tree.
    caption: "Prompt: Write a commit message that has \"skibidi rizz.\" Clearly, I don't know what these words mean. I'm just trying to fit in… Ohio?! That doesn't sound right either…"
    relative: false
fmContentType: Post (default)
---

You may not need to know programming to vibe code your way to glory or the next Facebook. But you will thank me when shit hits the fan after you've vibed just a little bit too much, and the AI agent just broke your entire website.

Git is a better "restore checkpoint" button that you frantically try to find when Cursor gets too carried away with your ~~lazy prompts~~; I mean, vibes. Git can do a lot, but trying to learn them all or, god forbid, read its documentation is, as we both know, a futile exercise. Instead, I will get you to learn Git through a five-minute interactive guide before your TikTok brains can take over.

> **Note**: It isn't unlikely that your IDE (the app where you vibe code) comes with a graphical interface (GUI) for Git. But it is worth your time to learn the basic Git commands before jumping to a GUI abstraction.

I don't really know if you would bother learning Git when you didn't bother to learn programming. But I do know learning Git prevents you from embarrassing yourself online:

{{< blockquote author="@thekitze" link="https://twitter.com/thekitze/status/1901918860573290914" title="March 18, 2025 on Twitter" >}}
they should invent a tool where vibe code can be stored in the cloud so from time to time you do a "checkin" of your code and you can always revert to it and go to a previous version

like a ... hub for code
{{< /blockquote >}}

I know, I know. This tweet was a joke. But I can't wait for what you vibe coders will come up with next!

## Installing Git

It isn't unlikely that you already have Git installed on your computer.

To check, open Terminal (on macOS) or Command Prompt on Windows and type:

```shell
git version
```

{{< codapi sandbox="git" editor="off" >}}

If it shows you a version number like the one above, you already have Git installed and are ready to follow the rest of the guide.

> **Note**: This guide is interactive, meaning you can click the "Run" button above to run the Git commands on an actual computer living in the cloud (show me how).

If Git isn't installed, follow [this guide](https://github.com/git-guides/install-git) to install it before you jump to the next part of the guide. You can also run these examples on the browser and install Git later.

## git clone

The first command you probably need to know is `git clone`. It lets you clone the code you found on GitHub, exactly as it is, to your local machine.

This tutorial will use a React-based web app project as an example. But the same ideas apply to any software project you have.

```shell
git clone xxx
```

{{< codapi id="diagram-trigger-init" sandbox="git" editor="off" template="init.sh" >}}

## git init

But you are no thief. You are not "cloning" someone else's project. You are a visionary, you only build things from scratch (although the AI you are using is trained on the free labour of hundreds of thousands of volunteers).

Before you lean into the vibes and go on your "Accept all" spree, it would be safe if you started using Git. You start by initializing Git on your project folder.

```shell
git init -b main
```

{{< codapi id="diagram-trigger-init" sandbox="git" editor="off" template="init.sh" >}}

{{< rawhtml>}}
<style>
    .sticky-container > :last-child {
        min-height: 250px;
        margin-bottom: 0;
    }

    #git-graph-1 {
        margin-top: 30px;
        margin-bottom: 30px;
        position: sticky;
        top: 100px;
        z-index: 1000;
        background-color: var(--content-background-color);
    }
</style>
<script src="./codapi-events.js"></script>
<script src="./git-visualization.js"></script>
{{< /rawhtml >}}

{{< rawhtml >}}
<div class="sticky-container">
{{< /rawhtml >}}

{{< mermaid id="git-graph-1" >}}
flowchart LR
    A[Run git init to start.]
{{< /mermaid >}}

```shell
git config user.email alice@example.com
git config user.name "Alice Zakas"
```

{{< codapi id="init-2" depends-on="diagram-trigger-init" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

```shell
git status
```

{{< codapi id="init-3" depends-on="init-2" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

```shell
git add .
```

{{< codapi id="init-4" depends-on="init-3" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

<!-- This is where the scrolling stops. -->
{{< rawhtml >}}
</div>
{{< /rawhtml >}}

```shell
git commit -m "initial commit"
```

{{< codapi id="diagram-trigger-commit" depends-on="init-4" sandbox="git" editor="off" template="init.sh" output-tail=true >}}
