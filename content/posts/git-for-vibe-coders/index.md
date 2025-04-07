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

You may not need to learn programming to vibe code your way to glory—or the next Facebook. But you will thank me when things go sideways after you've vibed _just a little too much_ and your AI agent casually breaks your entire website.

Git is a better "restore checkpoint" button that you frantically try to find when Cursor gets too carried away with your ~~lazy prompts~~; I mean, vibes. Git can do a lot, but trying to learn it all or, god forbid, [read the documentation](https://git-scm.com/doc) is, as we both know, a futile exercise. Instead, I will get you to learn _enough_ Git through a ~~five~~ ~~ten~~ thirteen?-minute interactive guide before your TikTok brains can take over.

> **Note**: It isn't unlikely that your IDE (the app where you vibe code) comes with a graphical interface (GUI) for Git. But it is worth your time to learn the basic Git commands before jumping to a GUI abstraction.

I don't really know if you would bother learning Git when you didn't bother to learn programming. But I do know learning Git prevents you from embarrassing yourself online:

{{< blockquote author="@thekitze" link="https://twitter.com/thekitze/status/1901918860573290914" title="March 18, 2025 on Twitter" >}}
they should invent a tool where vibe code can be stored in the cloud so from time to time you do a "checkin" of your code and you can always revert to it and go to a previous version

like a ... hub for code
{{< /blockquote >}}

I know, I know—this tweet was a joke. But honestly, I can't wait for what vibe coders will come up with next!

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

{{< figure src="/images/git-for-vibe-coders/git-install.png#center" title="Git GUI in Cursor" caption="Everything you learn from this guide has been abstracted into a button." link="/images/git-for-vibe-coders/git-install.png" target="_blank" class="align-center" >}}

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

The example, `my-vibe-app` contains the following files:

```shell
tree
```

{{< codapi sandbox="git" editor="off" template="init.sh" >}}

Which is just the boilerplate React app.

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
        min-height: 365px;
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

This is equivalent to saying, "Hey, Git, **start keeping track of changes in my project folder**." Your boring folder is now a Git repository.

There's also a cryptic flag, `-b main`. Here, the `-b` stands for "branch", and `main` is the branch name. i.e., We initialize the Git repository with a new branch named `main`.

The `main` branch will be our default branch. To experiment/surrender yourself to the vibes and click "Accept all," you can create a new branch called, say, `feature`. Now, **any changes you make will be local to the feature branch and won't affect the main branch**, allowing you to roll back changes or eventually "merge" (accept) the changes to `main` if it works.

You will learn about branching and merging later, but for now, all you need to know is you have Git working in your project repository.

## git status

To check if you have Git set up, run:

```shell
git status
```

{{< codapi id="sequence-a-3" depends-on="diagram-trigger-init" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

It gives us a lot of useful information:

1. The branch we are on (`main`).
2. The list of "untracked" files and, as we will see later,
3. The "staged" files.
4. The ignored files and more.


{{< figure src="/images/git-for-vibe-coders/git-status.png#center" title="Untracked Files" caption="Once you understand how to use Git, this GUI becomes more intuitive." link="/images/git-for-vibe-coders/git-status.png" target="_blank" class="align-center" >}}

We will be using the `git status` command a lot to **check the status** before running a Git command.

## git add

Let's start tracking the files. If you look at the output from the `git status` command, you will see a mention of a `git add` command. The `git add` command **lets you "stage" files**.

Staging sounds a lot more complicated than it really is. Imagine you are a chef:

1. You are working in a kitchen (your project folder)
2. You have a bunch of ingredients lying around (your files)
3. You want to prepare a dish (a "commit"; we will learn this later)

Before preparing the dish, you lay out all the ingredients you will use on a prep table. This prep table is the staging area.

Let's just add all files to the staging area for now. This can be done as shown below:

```shell
git add .
```

{{< codapi id="sequence-a-4" depends-on="sequence-a-3" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

Now, if you check the status:

```shell
git status
```

{{< codapi id="sequence-a-4-1" depends-on="sequence-a-4" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

The "Untracked files" are now "Changes to be committed."

{{< figure src="/images/git-for-vibe-coders/git-add.png#center" title="\"Staging\" the changes" caption="\"Changes\" are now \"Staged Changes.\"" link="/images/git-for-vibe-coders/git-add.png" target="_blank" class="align-center" >}}

You can also **choose which files to stage** instead of staging all files. We will look into it more later.

## git commit

Now that your files are staged—laid out neatly on your chef's prep table—_it's time to cook_. Committing files is saying, "Git, lock in; I want to **save this moment in time**."

To commit the staged files, run:

```shell
git commit -m "initial commit"
```

{{< codapi id="diagram-trigger-commit" depends-on="sequence-a-4" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

The `-m` flag stands for "message." This is your **short diary entry** for the change. **Write a message that makes sense** when you look back in three months when your project is on fire (it is not fire 🔥, it is on fire 🧯). Since it is our first commit, "initial commit" works.

{{< figure src="/images/git-for-vibe-coders/git-commit.png#center" title="\"Commiting\" the staged changes" caption="While I preach to write good commit messages, most of mine are just fixes. Of course, when things break in the future, I'm well and truly fu—" link="/images/git-for-vibe-coders/git-commit.png" target="_blank" class="align-center" >}}

If your project ever breaks in the future, you can come back to this exact moment, this exact commit, and be like:

> Ah yes, simpler times. The vibes were pure then.

Now, if you check the status, you will see a clean "tree":

```shell
git status
```

{{< codapi id="sequence-a-5" depends-on="diagram-trigger-commit" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

You're now versioned and vibin'.

## git branch, checkout, diff

You've got your `main` branch. It's clean. It works.

But now you want to add a new feature.

Are you about to mess up your perfectly fine project?

_Absolutely not._

Instead, you create a new branch—a **safe space where you can vibe freely without breaking the main project**.

To create a new branch called `feature`, run:

```shell
git branch feature
```

{{< codapi id="diagram-trigger-branch" depends-on="sequence-a-5" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

Then switch to it from the `main` branch:

```shell
git checkout feature
```

{{< codapi id="sequence-a-6" depends-on="diagram-trigger-branch" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

> **Tip**: You can create a new branch and switch to it in a single command:
>
> ```shell
> git checkout -b feature
> ```
>
> Trust me, you don't want the carpal tunnel syndrome from typing that extra line.

{{< figure src="/images/git-for-vibe-coders/git-branch-1.png#center" title="Click the \"main\" branch at the bottom-left of the window" caption="This is the current branch you're on." link="/images/git-for-vibe-coders/git-branch-1.png" target="_blank" class="align-center" >}}

{{< figure src="/images/git-for-vibe-coders/git-branch-2.png#center" title="Create a new \"feature\" branch from the popup" caption="You can also use this to switch between different branches" link="/images/git-for-vibe-coders/git-branch-2.png" target="_blank" class="align-center" >}}

Let's make a slight change in the code. For example, I will just update the `<h1>` header in the `src/App.jsx` file:

```diff {title="src/App.jsx"}
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
-     <h1>Vite + React</h1>
+     <h1>My Vibe App</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
```

```shell {id="update-file" hidden=true}
# Check if directory exists, create if needed
mkdir -p src
# Create modified App.jsx file with changed h1 tag
cat > src/App.jsx << 'EOF'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>My Vibe App</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
EOF
echo "Updated src/App.jsx successfully"
```

{{< codapi id="sequence-a-7" depends-on="sequence-a-6" sandbox="git" editor="off" files="#update-file:main.sh" output-tail=true hidden=true >}}

Now, if you check the status:

```shell
git status
```

{{< codapi id="sequence-a-8" depends-on="sequence-a-7" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

Git will tell you that the file was modified.

Now, try running:

```shell
git diff
```

{{< codapi id="sequence-a-9" depends-on="sequence-a-8" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

It **shows you exactly what changed**, i.e., what was removed and what was added. The `+` shows the added text, and the `-` shows the removed text.

Let's commit the changes like we did before:

```shell
git add src/App.jsx
git commit -m "update the app title"
```

{{< codapi id="diagram-trigger-commit-feature-1" depends-on="sequence-a-9" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

You've now **committed the changes only to the** `feature` **branch**. Your `main` branch is still chillin' like nothing happened.

Let's make another change. This time, we'll increase the `border-radius` of the `button` from `8px`:

```diff {title="src/index.css" linenos="inline" lineNoStart=38}
button {
- border-radius: 8px;
+ border-radius: 10px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
```

```shell {id="update-css" hidden=true}
# Check if directory exists, create if needed
mkdir -p src
# Create modified App.jsx file with changed h1 tag
cat > src/index.css << 'EOF'
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 10px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
EOF
echo "Updated src/index.css successfully"
```

{{< codapi id="sequence-a-10" depends-on="diagram-trigger-commit-feature-1" sandbox="git" editor="off" files="#update-css:main.sh" output-tail=true hidden=true >}}

```shell
git add src/index.css
git commit -m "increase border radius"
```

{{< codapi id="diagram-trigger-commit-feature-2" depends-on="sequence-a-10" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

You can make more changes and commit more times. **Every commit is a checkpoint**.

## git merge

Once you're happy with your new features, it's time to bring them back into your app.

First switch to the `main` branch:

```shell
git checkout main
```

{{< codapi id="sequence-a-11" depends-on="diagram-trigger-commit-feature-2" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

<!-- This is where the scrolling stops. -->
{{< rawhtml >}}
</div>
{{< /rawhtml >}}

Then, "merge" your `feature` branch into `main`:

```shell
git merge feature
```

{{< codapi id="diagram-trigger-merge" depends-on="sequence-a-11" sandbox="git" editor="off" template="init.sh" output-tail=true >}}

{{< figure src="/images/git-for-vibe-coders/git-merge.png#center" title="Switch back to \"main\" and find the \"Merge\" option from the dropdown" caption="Follow the same steps as before on the GUI to switch back to the `main` branch from the `feature` branch." link="/images/git-for-vibe-coders/git-merge.png" target="_blank" class="align-center" >}}

And just like that, the new and improved vibes are part of your main project, and you are basically a Git wizard 🧙🏽‍♀️.

## .gitignore File

So your feature is merged, your app is vibing... and then Git hits you with this:

```shell
...
modified: node_modules/globals/
modified: node_modules/has-flag/
modified: node_modules/ignore/
modified: node_modules/import-fresh/
modified: node_modules/imurmurhash/
modified: node_modules/is-extglob/
modified: node_modules/json-stable-stringify-without-jsonify/
...
```

> **Note**: If you followed along locally, you might have already seen something similar.

_Why is Git tracking 1000 files you never touched?_

Because it is doing what it was told—track _everything_—unless you say otherwise. That's where the `.gitignore` file comes in.

It's a **special file where you tell Git, "Don't even look at these."**

In our case, the `node_modules` folder should never be tracked. So you can create a file named `.gitignore` in the root of the project and add:

```text {title=".gitignore"}
node_modules
```

You can also ignore irrelevant system files like `.DS_Store` and sensitive `.env` files or **any file you wouldn't want to upload to the cloud**. If you are unsure what to ignore, ask Cursor or use [one of these templates](https://github.com/github/gitignore/) as a starting point.

## git remote

So far, we've been vibin' locally. But at some point, you'll want to **connect your local project to GitHub**, so you can back it up, share it, deploy it, and vibe with others.

First, [create a new repository on GitHub](https://github.com/new).

{{< figure src="/images/git-for-vibe-coders/new-repository.png#center" title="Creating a new repository" caption="Go to [github.com/new](https://github.com/new) to create a new repository if you can't find the right button." link="/images/git-for-vibe-coders/new-repository.png" target="_blank" class="align-center" >}}

Once you do, GitHub will show you a page with a bunch of helpful stuff.

{{< figure src="/images/git-for-vibe-coders/git-remote.png#center" title="Copy the link to your \"remote\" repository" caption="You can just follow the steps mentioned here to get started with Git." link="/images/git-for-vibe-coders/git-remote.png" target="_blank" class="align-center" >}}

Just copy the URL it gives you, something like:

```shell
https://github.com/pottekkat/my-vibe-app.git
```

Now head back to your terminal to connect your local project to this "remote" repository:

```shell
git remote add origin https://github.com/pottekkat/my-vibe-app.git
```

Here, `origin` is the **nickname we give to the remote repository**. You can call it whatever you want, but `origin` is the convention. The URL, as you might have guessed, is where **Git will "push" your code to** (and "pull" from).

You can check if it worked with:

```shell
git remote -v
```

_Welcome to the internet!_

## git push, pull

Now that you have an `origin` remote established, you can **use** `git push` **to send your local commits to GitHub**:

```shell
git push -u origin main
```

This sends your `main` branch to the `origin` remote. The `-u` flag tells Git to **set this as the default**, so next time, you can just run:

```shell
git push
```

And Git will know where to push.

If all goes well, you'll see your commits show up on GitHub, and others can now clone your project like we did earlier.

Similarly, if you or someone else makes changes and pushes to your GitHub repository, you can **bring those changes into your local project** with:

```shell
git pull
```

This **downloads any new commits from remote and merges them** into your local branch.

> **Tip**: Always pull before you push.

## Next Steps

This article has already gone on longer than your peak attention span. So, I now graciously concede your attention back to TikTok slop.

Here's what you have learned so far:

1. Clone a repository
2. Configure Git
3. Initialize Git in a project
4. Check the Git status
5. Stage files
6. Commit changes
7. Create new branches
8. Merge two branches
9. Create a `.gitignore` file
10. Configure a remote repository
11. Push to and pull from a remote

There's still more to learn, but this is enough to get by. To dive deeper, here are some excellent resources:

- **[Learn Git Branching](https://learngitbranching.js.org/)**: An interactive and intuitive playground that promises to teach you Git while having fun.
- **[Git Immersion](https://gitimmersion.com/)**: A longer guide that walks through the fundamentals of Git.
- **[Git by example](https://antonz.org/git-by-example/)**: A hands-on browser-based playground similar to this one.
- **[Git Cheat Sheet](https://training.github.com/downloads/github-git-cheat-sheet/)**: GitHub's official Git cheat sheet for those "wait, what was that command again?!" moments.
- **[Dangit, Git!?!](https://dangitgit.com)**: Everyone eventually makes a mess with Git and don't know what to do. This is for when you mess up but don't know what or how bad you messed up.
- **[Flight rules for Git](https://github.com/k88hudson/git-flight-rules)**: This is similar to _Dangit, Git!?!_ but is more comprehensive.

Or just **keep using Git**. You'll _eventually_ get the hang of it.
