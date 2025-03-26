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
    image: /images/git-for-vibe-coders/deepseek-banner.jpg
    alt: Photo of the DeepSeek chat interface.
    caption: "Prompt: Write a commit message that has \"skibidi rizz.\" Clearly, I don't know what these words mean. I'm just trying to fit in… Ohio?! That doesn't sound right either…"
    relative: false
fmContentType: Post (default)
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur eleifend velit, sit amet venenatis risus posuere auctor. Etiam rhoncus ex nec arcu malesuada, et pellentesque mi varius. Aenean eu ante quis nunc molestie ultricies ac ut elit. Donec sit amet tellus id enim imperdiet viverra. Morbi mauris diam, scelerisque non tortor quis, condimentum semper mauris. Vestibulum aliquet placerat ante, nec eleifend ligula venenatis eget. Phasellus a turpis eget sapien varius tincidunt eget vitae mauris.

{{< blockquote author="@thekitze" link="https://twitter.com/thekitze/status/1901918860573290914" title="March 18, 2025 on Twitter" >}}
they should invent a tool where vibe code can be stored in the cloud so from time to time you do a "checkin" of your code and you can always revert to it and go to a previous version

like a ... hub for code
{{< /blockquote >}}

Maecenas sapien diam, sagittis sit amet vehicula at, dapibus a neque. Duis at eros pulvinar, pellentesque velit varius, feugiat dui. Vivamus dapibus vel lorem sed convallis. Mauris nec purus pellentesque, tincidunt eros vitae, aliquam elit. Pellentesque mattis massa vitae tortor vehicula, eu aliquet enim laoreet. Pellentesque pharetra elit ac euismod bibendum. Duis augue lectus, sodales vel porta nec, lacinia eget eros. Nam nec luctus lacus. Vivamus ultrices ultricies velit quis volutpat.

Aenean tristique magna ut quam vulputate lacinia. Vivamus commodo luctus mauris, sit amet vehicula purus consequat a. Donec at blandit sapien, ac pretium risus. Fusce fringilla, felis eu maximus dictum, quam sapien placerat sapien, id facilisis ante turpis in lorem. Aenean at suscipit velit. Ut dui ligula, tincidunt in ligula ac, aliquet aliquet orci. Sed fermentum neque semper massa maximus mollis. Sed ac mi sed dui sodales cursus eget posuere sapien. Mauris blandit neque et egestas consectetur. Praesent non purus id nisi interdum placerat. Etiam id risus quis metus consectetur feugiat. In efficitur ipsum vitae magna pellentesque, id tempor mauris cursus. In lectus nisl, ultrices ac hendrerit eget, ultricies pulvinar arcu. Donec erat ipsum, pharetra eu mi sed, volutpat sodales mauris.

Sed ac mi sed dui sodales cursus eget posuere sapien. Mauris blandit neque et egestas consectetur. Praesent non purus id nisi interdum placerat. Etiam id risus quis metus consectetur feugiat. In efficitur ipsum vitae magna pellentesque, id tempor mauris cursus. In lectus nisl, ultrices ac hendrerit eget, ultricies pulvinar arcu. Donec erat ipsum, pharetra eu mi sed, volutpat sodales mauris.

```shell
git init -b main
```

{{< codapi id="diagram-trigger-init" sandbox="git" editor="off" template="init.sh" >}}

{{< rawhtml>}}
<style>
    #git-graph-1 {
        margin-top: 30px;
        margin-bottom: 30px;
        position: sticky;
        top: 30px;
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

{{< rawhtml >}}
</div>
{{< /rawhtml >}}

```shell
git commit -m "initial commit"
```

{{< codapi id="diagram-trigger-commit" depends-on="init-4" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

Maecenas sapien diam, sagittis sit amet vehicula at, dapibus a neque. Duis at eros pulvinar, pellentesque velit varius, feugiat dui. Vivamus dapibus vel lorem sed convallis. Mauris nec purus pellentesque, tincidunt eros vitae, aliquam elit. Pellentesque mattis massa vitae tortor vehicula, eu aliquet enim laoreet. Pellentesque pharetra elit ac euismod bibendum. Duis augue lectus, sodales vel porta nec, lacinia eget eros. Nam nec luctus lacus. Vivamus ultrices ultricies velit quis volutpat.

Aenean tristique magna ut quam vulputate lacinia. Vivamus commodo luctus mauris, sit amet vehicula purus consequat a. Donec at blandit sapien, ac pretium risus. Fusce fringilla, felis eu maximus dictum, quam sapien placerat sapien, id facilisis ante turpis in lorem. Aenean at suscipit velit. Ut dui ligula, tincidunt in ligula ac, aliquet aliquet orci. Sed fermentum neque semper massa maximus mollis. Sed ac mi sed dui sodales cursus eget posuere sapien. Mauris blandit neque et egestas consectetur. Praesent non purus id nisi interdum placerat. Etiam id risus quis metus consectetur feugiat. In efficitur ipsum vitae magna pellentesque, id tempor mauris cursus. In lectus nisl, ultrices ac hendrerit eget, ultricies pulvinar arcu. Donec erat ipsum, pharetra eu mi sed, volutpat sodales mauris.
