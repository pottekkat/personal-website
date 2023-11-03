---
title: "Works on My Machine"
date: 2023-11-03T09:22:24+05:30
draft: false
ShowToc: false
ShowRelatedContent: true
summary: "A tale of how I spent an irrationally long time figuring out why the tests pass on my machine but fail in the CI."
tags: ["software engineering", "open-source"]
categories: ["Software Engineering"]
cover:
  image: "/images/works-on-my-machine/surreal-it-banner.jpg"
  alt: "A surreal depicting of a software engineer's workstation."
  caption: "My machine according to AI."
  relative: false
---

I have been plagued by test failures lately. Every pull request I open results in seemingly unrelated test failures in our CI/CD pipelines.

While some of these are actually unrelated, others are legit. This is a story about one such legitimate issue that I was convinced was unrelated and had something to do with the CI environment.

## In Search for a Better UX

I have been working on a [command line tool for APISIX called ADC](/posts/managing-apisix-declaratively/) to improve its user experience. Last week, I [fixed](https://github.com/api7/adc/pull/85) a [bug](https://github.com/api7/adc/issues/83) that was causing a subcommand to not work as intended, preventing new users from doing anything beyond the first step.

When a user runs `adc configure` on a new machine, it creates a `.adc.yaml` configuration file in their home directory. If a configuration file is already present, a user has to pass the `-f` flag to overwrite the file, or the command will fail, saying that the file already exists.

In the current flow, ADC first creates an empty file if it doesn't exist and proceeds to shoot itself in the foot with the "file already exists" error when it is run initially without the `-f` flag. So, a new user will likely fail to configure ADC because it is stuck in an endless self-sabotage loop unless they know about this and use the `-f` flag every time. Bad UX indeed.

Fixing this was, of course, critical, but we were moving fast, and breaking things was inevitable. This inevitability can be mitigated by reducing the reliance on patch fixes and investing time and effort to think about more permanent solutions. And sometimes, these permanent solutions can be simpler and more straightforward than the patchy ones.

## Simple is Better

The simplest fix was to remove the patchiness of the code and remove the part that created the empty configuration file. Now, if a user runs `adc configure` for the first time, it would not be stuck in the "file already exists" cycle. And that is [what I did](https://github.com/api7/adc/pull/85/commits/2090cd7ee7f40351d9b82e83f502844eb6c30794).

But it wasn't the first solution I thought of. We could keep creating the empty file if it is not present, and we could add a check to write to it correctly if it is empty and only throw an error or require the `-f` flag if the file actually contains any APISIX configuration.

This is the definition of patchy and has a lot of potential to cascade into more bugs in the future. The first solution was the simpler one.

I opened a pull request and waited for all the checks to turn green. But instead, I was greeted by some [cryptic error messages](https://github.com/api7/adc/actions/runs/6642600251/job/18047731482?pr=85).

## The CI is Broken

I was convinced the CI was broken after running the tests locally and seeing it all pass. The error messages in the CI did not seem to point to anything specific, and all of the other tests were passing. And it is easier to blame it on automation than admitting you might have broken something.

But blaming it on the CI was difficult. The only difference I could find was the difference in operating systems. The CI runs on Ubuntu, so I switched it to macOS to see if that fixes it, but I ended up with the same error.

Our biases have a way of clouding our judgment. It hides things right in front of us because we are convinced otherwise. But this philosophical enlightenment does not sweeten the blow of admitting I was wrong. The CI isn't broken, but my code is.

The one difference between my local environment and the CI environment was the fact that in my local environment, there was a configuration file present when I ran the tests. However, the CI environment is new, and it did not have this file, which was the scenario I should have been testing in the first place. But why does it fail?

## Passing the Blame

It turns out Viper, our configuration management library, has an inconvenient issue that requires a file to be present for the `WriteConfig` function to work. On the other hand, the `SafeWriteConfig` function only writes the configuration to a file only if the file does not exist.

In our CI, when the configuration file does not exist, and we pass the `-f` flag to overwrite it, the subcommand will fail because it can’t find a file to overwrite.

A combination of both `WriteConfig` and `SafeWriteConfig` could solve our issue. i.e., safe write with the latter if the file is not present, and if that throws an error, write normally with the former. But a more elegant solution was to use the `WriteConfigAs` function, which creates a file before writing if it doesn’t exist.

```diff
if overwrite {
-       err = viper.WriteConfig()
+       err = viper.WriteConfigAs(cfgFile)
    } else {
        err = viper.SafeWriteConfig()
}
```

Ideally, both of these functions should behave the same in this regard. A [lot of people think so](https://github.com/spf13/viper/issues/433), too. But for some reason, there is little progress with the [attempt to add/fix this feature](https://github.com/spf13/viper/pull/936).

With that, I reran the tests, which passed with flying green colors.

## Never Not Write Tests

This whole scenario has been a textbook example of how robust tests can help catch non-trivial bugs in code. The amount of effort put into writing these tests will be insignificant compared to the time and effort it would have taken to hunt and fix bugs.

So, never not write tests.