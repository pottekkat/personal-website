---
title: Git for Vibe Coders and Non-Programmers
slug: git-for-vibe-coders
date: 2025-04-14T09:28:09+05:30
draft: false
toc:
  show: true
  open: true
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

{{< rawhtml >}}
<script src="https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.js.iife.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/driver.js@latest/dist/driver.css"/>

<style>
/* Remove rounded borders from popover */
.driver-popover {
  border-radius: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.driver-popover button {
  border-radius: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Add font family to driver elements */
.driver-popover-title, .driver-popover-description, .driver-popover-footer, .driver-popover-progress-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.driver-popover-title {
    font-size: 16px;
}

/* Remove hover effects from disabled buttons while keeping cursor style */
.driver-popover button[disabled]:hover {
  background-color: inherit !important;
  color: inherit !important;
}
</style>
{{< /rawhtml >}}

You may not need to know programming to vibe code your way to glory or the next Facebook. But you will thank me when shit hits the fan after you've vibed just a little bit too much, and the AI agent just broke your entire website.

Git is a better "restore checkpoint" button that you frantically try to find when Cursor gets too carried away with your ~~lazy prompts~~; I mean, vibes. Git can do a lot, but trying to learn them all or, god forbid, read its documentation is, as we both know, a futile exercise. Instead, I will get you to learn Git through a five-minute interactive guide before your TikTok brains can take over.

> **Note**: It isn't unlikely that your IDE (the app where you vibe code) comes with a graphical interface (GUI) for Git. But it is worth your time to learn the basic Git commands before jumping to a GUI abstraction.

I don't really know if you would bother learning Git when you didn't bother to learn programming. But I do know learning Git prevents you from embarrassing yourself online:

{{< blockquote author="@thekitze" link="https://twitter.com/thekitze/status/1901918860573290914" title="March 18, 2025 on Twitter" >}}
they should invent a tool where vibe code can be stored in the cloud so from time to time you do a "checkin" of your code and you can always revert to it and go to a previous version

like a ... hub for code
{{< /blockquote >}}

I know, I know. This tweet was a joke. But I can't wait for what you vibe coders will come up with next!

## Install Git

It isn't unlikely that you already have Git installed on your computer.

To check, open Terminal (on macOS) or Command Prompt on Windows and type:

```shell {id="init-driver-code"}
git version
```

{{< codapi id="init-driver-codapi" sandbox="git" editor="off" >}}

If it shows you a version number like the one above, you already have Git installed and are ready to follow the rest of the guide.

> **Note**: This guide is interactive, meaning you can click the "Run" button to run the Git command on a computer living in the cloud. {{< rawhtml >}}<a href="#" id="show-me-how"><i>Show me how!</i></a>{{< /rawhtml >}}

{{< rawhtml >}}
<script>
const driver = window.driver.js.driver;

const driverObj = driver({
    animate: false,
    showProgress: true,
    showButtons: ['next', 'previous'],
    stagePadding: 0,
    stageRadius: 0,
    steps: [
    { element: '#init-driver-code', popover: { title: 'Git Command', description: 'This is the Git command to be run.', side: "top", align: 'start' }},
    { 
      element: '#init-driver-codapi > codapi-toolbar > button', 
      popover: { 
        title: 'Run Button', 
        description: '<strong>Click the "Run" button</strong> to run the command on a machine in the cloud.', 
        side: "bottom", 
        align: 'start' 
      },
      onHighlighted: (element, step, { state }) => {
        // When this step is active, check the current state of the output element
        const nextBtn = state.popover.nextButton;
        const output = document.querySelector('#init-driver-codapi > codapi-output');
        
        // Initial state - check if output is already visible
        if (output && !output.hasAttribute('hidden')) {
          // Output is already visible, enable the next button right away
          if (nextBtn) {
            nextBtn.removeAttribute('disabled');
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
          }
        } else {
          // Output is not visible, disable the next button
          if (nextBtn) {
            nextBtn.setAttribute('disabled', 'disabled');
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
          }
          
          // Set up a mutation observer to watch for the hidden attribute to be removed
          if (output) {
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.attributeName === 'hidden' && !output.hasAttribute('hidden')) {
                  // Enable the next button when hidden attribute is removed
                  if (nextBtn) {
                    nextBtn.removeAttribute('disabled');
                    nextBtn.style.opacity = '1';
                    nextBtn.style.cursor = 'pointer';
                  }
                  // Disconnect observer after enabling the button
                  observer.disconnect();
                }
              });
            });
            
            // Start observing the output element for attribute changes
            observer.observe(output, { attributes: true });
            
            // Store the observer in a variable to be able to disconnect it when needed
            state.runBtnObserver = observer;
          }
        }
      },
      // Clean up when leaving this step
      onDeselected: (element, step, { state }) => {
        // Disconnect the observer if it exists
        if (state.runBtnObserver) {
          state.runBtnObserver.disconnect();
          state.runBtnObserver = null;
        }
      }
    },
    { 
      element: '#init-driver-codapi > codapi-output > pre', 
      popover: { 
        title: 'Command Output', 
        description: 'This is the output of the command.', 
        side: "bottom", 
        align: 'start' 
      }
    },
  ]
});

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get the "show me how" link and add click event listener
  const showMeHowLink = document.getElementById('show-me-how');
  if (showMeHowLink) {
    showMeHowLink.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default link behavior
      driverObj.drive();
    });
  }
});
</script>
{{< /rawhtml >}}

If Git isn't installed, follow [this guide](https://github.com/git-guides/install-git) to install it before you jump to the next part of the guide. You can also run these examples on the browser and install Git later.

## git config

You can start by configuring _your_ **username and email address**. I usually configure this globally with the `--global` flag:

```shell
git config --global user.email jane@acme.com
git config --global user.name "Jane Doe"
```

{{< codapi id="sequence-a-1" sandbox="git" editor="off" >}}

This tells Git who you are, and every time you "commit" your code, Git will record your name and email as the author of the commit.

_We'll learn more about commits shortly._

## git clone

One of the first commands you need to know is `git clone`. It lets you clone the dope code you found on GitHub to your computer.

This tutorial uses a [React-based web app](https://github.com/pottekkat/my-vibe-app) as an example. But the same ideas apply to any software project you have.

To clone a project, run:

```shell
git clone https://github.com/pottekkat/my-vibe-app.git
```

{{< codapi sandbox="git" editor="off" >}}

You can similarly clone any repository (public or private repositories you have access to) by swapping the URL.

{{< figure src="/images/git-for-vibe-coders/git-clone.png#center" title="Getting the git clone URL from a GitHub repository" caption="You are a coder; you do not click the \"Download ZIP\" button. That\'s for normies." link="/images/git-for-vibe-coders/git-clone.png" target="_blank" class="align-center" >}}

Before we move on, Git and GitHub. _What's the difference?_

Git is a **tool you run on your computer** to track changes to your code/files.

[GitHub is an entirely different service](https://docs.github.com/en/get-started/start-your-journey/about-github-and-git) that **hosts Git repositories in the cloud** to share and collaborate. Alternatives to GitHub, like [GitLab](https://gitlab.com) or [Bitbucket](https://bitbucket.org), do the same thing, but GitHub is just more popular.

## git init

But you are no thief! You are not "cloning" someone else's project. You are a visionary who ONLY builds things from scratch (although the AI you use is trained on the free labor of hundreds of thousands of developers).

Before you lean into the vibes and go on your "Accept all" spree, it would be safer if you started using Git. You can initialize Git on your project folder:

```shell
git init -b main
```

{{< codapi id="diagram-trigger-init" depends-on="sequence-a-1" sandbox="git" editor="off" template="init.sh" >}}

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

This is equivalent to saying, "Hey, Git, start keeping track of changes in my project folder." Your boring folder is now a Git repository.

There's also a cryptic flag, `-b main`. Here, the `-b` stands for branch, and `main` is the branch name. i.e., We initialize the Git repository with a new branch named `main`.

The `main` branch will be our default branch. To experiment/surrender yourself to the vibes and click "Accept all," you can create a new branch called, say, `feature`. Now, any changes you make will be local to the feature branch and won't affect the main branch, allowing you to roll back changes or eventually merge (accept) the changes to `main` if it works.

We will learn about merging later, but for now, all you need to know is we have Git working in your project repository.

You can check the current status of Git by running:

```shell
git status
```

{{< codapi id="sequence-a-3" depends-on="diagram-trigger-init" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

```shell
git add .
```

{{< codapi id="sequence-a-4" depends-on="sequence-a-3" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

<!-- This is where the scrolling stops. -->
{{< rawhtml >}}
</div>
{{< /rawhtml >}}

```shell
git commit -m "initial commit"
```

{{< codapi id="diagram-trigger-commit" depends-on="sequence-a-4" sandbox="git" editor="off" template="init.sh" output-tail=true >}}
