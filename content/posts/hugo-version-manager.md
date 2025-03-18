---
title: Using Hugo Version Manager (hvm) to Switch Between Different Hugo Versions
slug: hugo-version-manager
date: 2025-03-24T09:25:55+05:30
draft: false
toc:
  show: true
  open: true
ShowRelatedContent: false
description: A short walkthrough of how I use Hugo Version Manager (hvm) to manage different Hugo versions across projects.
summary: A quick guide to using the Hugo Version Manager (hvm) to download, manage, and switch between different versions of Hugo.
tags:
  - hugo
  - tutorials
  - tips
categories:
  - Tutorials
series: []
aliases: []
cover:
  image: /images/hugo-version-manager/buildings-banner.jpg
  alt: An old and a new building standing adjacent to each other.
  caption: Photo by [Nicolas Postiglioni](https://www.pexels.com/photo/low-angle-photo-of-two-adjacent-apartment-buildings-2374976/)
  relative: false
fmContentType: Post (default)
---

Hugo has been my go-to static site generator for the last five years. All my static websites, including this blog, are generated using Hugo. However, managing these different websites has become more difficult over the years.

The reason for this is that each of my websites uses a different Hugo version. This requires switching between versions of Hugo while I work on my websites, which is far from ideal.

You might argue that I can just update Hugo to the latest version and build all my websites. But that does not work very well in practice as new Hugo releases often have changes that break my websites. This becomes a mess when you have an especially big website with hundreds of static pages and a lot of custom components where testing for broken parts isn't easy.

You also don't need to upgrade Hugo unless you need the latest features (I don't), and Hugo has been stable for a while, which means I already have everything I expect from a static site generator in the Hugo version I'm using already.

So, to work on multiple websites, I needed to find a solution that would let me use a different Hugo version on each.

_Easily_.

This is where the neat little CLI `hvm` or the [Hugo Version Manager](https://github.com/jmooring/hvm) comes in. It works similarly in principle to other version managers and lets you install, use, and switch between different versions of Hugo.

In this article, I will walk you through installing, configuring, and using `hvm` to manage multiple Hugo versions.

## Installing `hvm`

You can download the latest version of the `hvm` binary for your operating system [from GitHub](https://github.com/jmooring/hvm/releases/latest). Once downloaded, you can move it to your `$PATH` to start using it. The commands below will take care of these two steps:

```bash
# Replace OS_ARCH with your system:
# darwin-arm64, darwin-amd64, linux-amd64, linux-arm64, windows-amd64
OS_ARCH=darwin-arm64
VERSION=v0.8.2

curl -sL "https://github.com/jmooring/hvm/releases/download/${VERSION}/hvm-${OS_ARCH}.tar.gz" -o hvm.tar.gz
tar -xzf hvm.tar.gz
chmod +x hvm
sudo mv hvm /usr/local/bin/
```

Alternatively, you can install `hvm` from source (requires Go 1.24+):

```bash
VERSION=v0.8.2
go install github.com/jmooring/hvm@${VERSION}
```

> **Note**: The latest version of `hvm` at the time of writing is `v0.8.2`. You can check the latest version on the [GitHub releases page](https://github.com/jmooring/hvm/releases).

To make sure `hvm` is installed correctly, run:

```bash
hvm help
```

This will display the help menu with all the available subcommands.

### Creating an Alias

Before you use `hvm`, you must create an alias for the `hugo` command to override the default Hugo executable. To add the alias, copy and run the appropriate command for your shell from below:

```bash
# For Zsh
hvm gen alias zsh >> ~/.zshrc

# For Bash
hvm gen alias bash >> ~/.bashrc

# For Fish
hvm gen alias fish >> ~/.config/fish/config.fish

# For Windows PowerShell
hvm gen alias powershell >> $PROFILE
```

Running this will generate the alias and append it to your shell configuration file.

> **Note**: You might need to restart your shell for the changes to take effect.

Now, when you run `which hugo`, you will get the following response indicating that the alias is working:

```shell
hugo () {
  hvm_show_status=true
  if hugo_bin=$(hvm status --printExecPathCached)
  then
    if [ "${hvm_show_status}" = "true" ]
    then
      printf "Hugo version management is enabled in this directory.\\n" >&2
      printf "Run 'hvm status' for details, or 'hvm disable' to disable.\\n\\n" >&2
    fi
  else
    if hugo_bin=$(hvm status --printExecPath)
    then
      if ! hvm use --useVersionInDotFile
      then
              return 1
      fi
    else
      if ! hugo_bin=$(whence -p hugo)
      then
        printf "Command not found.\\n" >&2
        return 1
      fi
    fi
  fi
  "${hugo_bin}" "$@"
}
```

## Installing a Hugo Version

To start using `hvm`, go to your website's home directory and run:

```shell
hvm use
```

`hvm` will prompt you with a list of available Hugo versions. You can pick the version to use, and `hvm` will create a `.hvm` file containing the version number and install that version of Hugo. This is what the `.hvm` file looks like for this website:

```text {title=".hvm"}
v0.118.2
```

Now, if you run `hugo version`, you will see that it is the version set in your `.hvm` file.

## Switching Between Hugo Versions

Switching between Hugo versions is now easy. You just have to create a `.hvm` file with the required version, and `hvm` will install and use that particular version of Hugo when you run the `hugo` command in the website repository.

You can also configure `hvm` to install and use a fallback Hugo version when the `.hvm` file is absent. First, install the fallback by running:

```shell
hvm install
```

Now, if the `.hvm` file is not in the website repository, `hvm` will use the fallback version of Hugo, which it just installed. This is particularly useful to pin specific Hugo versions on your older websites while always using the latest version on your new websites.

> **Tip**: You don't need to install the fallback version through `hvm` if you have already installed Hugo before installing `hvm`. In such scenarios, your already installed Hugo version will be used as the fallback.

A special thank you to [Joe Mooring](https://github.com/jmooring) for creating `hvm` and his endless contributions to the Hugo project!
