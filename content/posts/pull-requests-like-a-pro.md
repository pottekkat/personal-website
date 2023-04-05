---
title: "Pull Requests like a Pro"
date: 2021-09-15T17:52:25+05:30
draft: false
summary: "Tips to make High-Quality Pull Requests."
tags: ["tips", "open-source"]
categories: ["Open Source"]
cover:
    image: "images/pull-requests-like-a-pro/formula-1-banner.jpeg"
    alt: "Photo of a Formula 1 racing car coming out of the pit stops."
    caption: "Photo by [Dimitrije Djekanovic](https://www.pexels.com/photo/racing-team-with-their-racing-car-13857977/)"
    relative: false
---

I have been maintaining open source code for the past three years.

These are my tips for making better pull requests.

This is a short article, but you can check out this [Twitter thread](https://twitter.com/sudo_navendu/status/1437456596473303042) for a faster read.

## Tip 1: Follow Contributor Docs

Most open source projects have contributing docs (usually a [CONTRIBUTING.md](https://github.com/meshery/meshery/blob/master/CONTRIBUTING.md) file at the root of the repo) that cover how to set up your development environment, coding conventions, areas to contribute to, and more.

If you are looking to contribute to a project, it should be the second place you look into after the [README](https://github.com/meshery/meshery#readme) file.

{{< figure src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dh3n0tmz2y2gle49ewav.png#center" title="CONTRIBUTING.md" caption="From [github.com/meshery/meshery](https://github.com/meshery/meshery/blob/master/CONTRIBUTING.md)" link="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dh3n0tmz2y2gle49ewav.png" target="_blank" class="align-center" >}}

## Tip 2: Make Small and Focused Pull Requests

For the most part, your pull requests should do one thing and one thing only.

The problem with addressing multiple things in a single pull request is that the reviewers may only approve some of the changes, which could lead to lengthy discussions.

Small and focused pull requests reduce the time taken for reviews and make them likely to be merged.

{{< figure src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/klteluhjfn90k2hfe7to.png#center" title="13 lines of code to add a small feature" caption="From [github.com/meshery/meshery](https://github.com/meshery/meshery)" link="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/klteluhjfn90k2hfe7to.png" target="_blank" class="align-center" >}}

## Tip 3: Add Tests

If you are adding new code, make sure you also add automated tests.

A general rule of thumb is "If it can be tested, it should be tested."

## Tip 4: Use Pull Request Templates

Most open source projects have templates to guide contributors to document their pull requests.

The template shown below has sections for the contributors to fill in:

{{< figure src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/knvukchmgvajbzil8390.png#center" title="Pull request template" caption="From [github.com/openservicemesh/osm](https://github.com/openservicemesh/osm)" link="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/knvukchmgvajbzil8390.png" target="_blank" class="align-center" >}}

## Tip 5: Make Sure the Automated Tests Pass

Projects often run automated tests on all pull requests.

These tests are in place to ensure the code you add doesn't break any rule or code. Most projects have linters, build checks, and unit and integration tests.

If these checks are not passing, fix them and make sure all the tests pass before requesting a review.

Your code is unlikely to be merged if any of these checks are failing.

{{< figure src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oj5w3yqu7v4627wdpeyd.png#center" title="All systems go" caption="From [github.com/meshery/meshery](https://github.com/meshery/meshery)" link="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oj5w3yqu7v4627wdpeyd.png" target="_blank" class="align-center" >}}

## Tip 6: Document Your Pull Requests

This is probably **the most important** tip.

The goal of documenting your pull requests is to make the review process as easy as possible. A reviewer should get the context of your pull requests by skimming through their descriptions.

For this, you can:

- Write [self-documenting code](https://stackoverflow.com/questions/209015/what-is-self-documenting-code-and-can-it-replace-well-documented-code/209089#209089)

- Use comments liberally in your code

- Write clear commit messages

- And most importantly, write what your pull request does clearly

In the example below, the description shows what issue the pull request fixes, the changes made, and the change to the user experience.

This makes the pull request very easy to review.

{{< figure src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oqb563b2yjo9nie1rxzi.png#center" title="You can never explain too much" caption="From [github.com/meshery/meshery](https://github.com/meshery/meshery)" link="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/oqb563b2yjo9nie1rxzi.png" target="_blank" class="align-center" >}}

## Tip 7: Respond to Feedback

When you open a pull request, you are also opening a discussion on why the change is needed and why your pull request is the right way to add that change.

Make sure you respond to reviews, make changes as suggested, and ask for clarification if needed.

This would make the review process easier by getting you and the reviewer on the same page.

{{< figure src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uqkme7w60iijpiv8okv7.png#center" title="Sometimes discussions can get long" caption="From [github.com/meshery/meshery](https://github.com/meshery/meshery)" link="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uqkme7w60iijpiv8okv7.png" target="_blank" class="align-center" >}}

## Tip 8: Be Patient

Some open source maintainers are volunteers and spend their free time on the projects.

They may take some time to get to your pull request and review it.

Be patient while they do their thing. Take a break, drink a glass of water, and watch reruns of The Office.

## Bonus Tip

I write a lot about my experience in building, scaling, and maintaining open source projects.

So make sure you subscribe below for more such tips.
