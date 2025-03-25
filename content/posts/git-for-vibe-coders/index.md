---
title: Git for Vibe Coders and Non-Programmers
slug: git-for-vibe-coders
date: 2025-03-27T09:28:09+05:30
draft: false
toc:
    show: false
ShowRelatedContent: false
description: A practical + interactive crash course on Git (that slaps).
summary: A practical, hands-on, and interactive guide to Git for new coders and creative builders.
EnableCodapi: true
CodapiURL: localhost:1314/v1
ShowCodeCopyButtons: false
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
    image: /images/git-for-vibe-coders/deepseek-banner.jpg
    alt: Photo of the DeepSeek chat interface.
    caption: "Prompt: Write a commit message that has \"skibidi rizz.\" Clearly, I don't know what these words mean. I'm just trying to fit in ... Ohio?! That doesn't sound right..."
    relative: false
fmContentType: Post (default)
---

Test

{{< blockquote author="@thekitze" link="https://twitter.com/thekitze/status/1901918860573290914" title="March 18, 2025 on Twitter" >}}
they should invent a tool where vibe code can be stored in the cloud so from time to time you do a "checkin" of your code and you can always revert to it and go to a previous version

like a ... hub for code
{{< /blockquote >}}

```shell
git init
```

{{< codapi id="init-1" sandbox="git" editor="basic" template="init.sh" >}}

```shell
git status
```

{{< codapi id="init-2" depends-on="init-1" sandbox="git" editor="basic" template="init.sh"output-tail=true >}}
