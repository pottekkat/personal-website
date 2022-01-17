---
title: "Pull Requests Like a PRO"
date: 2021-09-15T17:52:25+05:30
weight: 80
draft: false
summary: "Tips to make High-Quality Pull Requests."
tags: ["tips", "open-source"]
categories: ["Open Source"]
cover:
    image: "images/pull-requests-like-a-pro/Pull Requests Like a PRO+.png"
    alt: "Image that shows Pull Requests Like a PRO"
    relative: false
---

With Hacktoberfest around the corner, here are some tips to make better Pull Requests for your next Open-Source contribution.

> As a maintainer and a contributor to Open-Source projects these are the things I look for when reviewing and take care of when submitting Pull Requests.

This is a fast read but if you want one even faster, check out [this Twitter thread](https://twitter.com/sudo_navendu/status/1437456596473303042).

## Tip 1: Contributing Docs are your Best Friends

Most Open-Source projects have a contributing doc(usually a [CONTRIBUTING.md](https://github.com/meshery/meshery/blob/master/CONTRIBUTING.md) file at the root of the repo) that contains all the necessary details on how to set up your development environment, coding conventions you have to follow and much more.

If you are looking to contribute to a project, that should be the next place to look into after the [ReadME](https://github.com/meshery/meshery#readme) file.

![A screenshot showing the contributing guide of the Meshery project in GitHub.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dh3n0tmz2y2gle49ewav.png)
_Contributing doc from the [Meshery](https://github.com/meshery/meshery) project_

## Tip 2: Document Your PRs

This is really important. I repeat this is really important.

You should make the reviewing process as easy as possible and a reviewer should be able to get the context of your PR with a quick glance.

For this, you can:
* Write self-documenting code (What is self-documenting code and how can it help? See [this great answer](https://stackoverflow.com/a/209089/12424846))
* Use comments liberally in your code
* Write clear commit messages and
* Most importantly, comment what your PR does clearly

As shown below, the PR description shows what issue it fixes, the change made in the PR and the actual new User-Experience.

This makes the PR very easy to review.

![A screenshot of a pull request description from GitHub showing how to document your PRs.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oqb563b2yjo9nie1rxzi.png)

_A Pull Request description example_

## Tip 3: Use Pull Request Templates

Most Open-Source projects will have a Pull Request template to guide newcomers and veterans alike into documenting their PRs properly.

As you can see below, the PR template has sections where the contributors are expected to fill details.

![A screenshot of a pull request template from Microsoft's Open Service Mesh project.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/knvukchmgvajbzil8390.png)
_Pull Request template from the [Open Service Mesh](https://github.com/openservicemesh/osm) project_

This would make the job of the reviewer much easier as they would be able to easily test it out, ask a domain expert to review and much more.

These also acts like a checklist that the contributor can tick off. For example: Questions like _"Did I write unit tests?", "Did I sign all of my commits?", "Is this a breaking change?"_ can be answered as you start filling the template.

## Tip 4: Make your PRs Small and Focused

Whenever possible, your Pull Requests should do one thing and one thing only.

The problem with addressing multiple concerns in a single PR is that the reviewer _may_ not agree with all the changes and this could potentially lead to long discussions.

So small and focused PRs would reduce the time taken for reviews and would make your PR most likely to get merged.

![A screenshot showing a pull request in GitHub that focuses on one thing.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/klteluhjfn90k2hfe7to.png)
_An Example Pull Request with just a single, focused change_

## Tip 5: Add Tests

If the project you are working on has automated tests, then make sure that you add tests for the code you are adding.

Not sure if you should write tests? Here is a **bonus tip**:

> If it can be tested, it should be tested.

## Tip 6: Make sure the Automated Tests Pass

Most projects have automated tests in their CI/CD pipelines which run on your Pull Requests.

These tests are in place to make sure that the code you are adding passes some constraints. These are mostly lint checks, build checks, unit tests and integration tests.

If these checks are not passing, fix it and make sure all the tests pass before asking for a review.

Your code is not likely to get merged if these checks fail.

![A screenshot showing a pull request in GitHub that focuses on one thing.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oj5w3yqu7v4627wdpeyd.png)

_All checks passed!_

## Tip 7: Respond to Feedback

When you open a Pull Request, you are also opening a discussion on why this change is needed and why your PR is the right way to add that change.

So, make sure that you respond to reviews, make changes to your PR as suggested by the reviewer and ask for clarification questions if needed.

This would make sure that you and the reviewer are on the same page and would make the PR reviews much easier.

![A screenshot showing a pull request in GitHub that focuses on one thing.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uqkme7w60iijpiv8okv7.png)
_Sometimes discussions can get really long! But these are necessary when you are adding a new feature with breaking changes_

## Tip 8: Be Patient

Most of the Open-Source maintainers are volunteers. They maintain projects during their free time off from their work.

So, they may take some time to get to your PR and review it.

So be patient while they do their thing. Take a break, drink a cup of coffee and watch Naruto.

## Bonus Tip:

I will be writing about Contributing to, Building, Scaling and Maintaining Open-Source projects here on [my blog](https://navendu.me/) as well as on [Twitter](https://twitter.com/sudo_navendu) and on the [DEV Community](https://dev.to/navendu).

In this last year, I have went from a noob Open-Source contributor to:
* Building [my own project](https://github.com/nsfw-filter/nsfw-filter) and making it to the [#1 Trending Repository on GitHub](https://twitter.com/sudo_navendu/status/1298191582101778433)
* Maintaining 2 [CNCF](https://www.cncf.io/) Projects and
* Working [full-time](https://github.com/navendu-pottekkat) in Open-Source

I would like to share everything I've learned to help as many people as possible who are interested in Open-Source.

So, follow along and may the source be with you!
