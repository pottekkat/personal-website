---
title: "Testing Webmention Sending"
date: "2019-01-15"
draft: false
summary: "A test post for validating webmention sending functionality."
tags: ["webmention", "indieweb", "test"]
categories: ["Tests"]
ShowWebmentions: true
response:
  type: reply
  url: https://webmention.rocks/test/1
  name: "Webmention Rocks Test #1"
---

This is a test post to validate that my website can successfully send webmentions to other IndieWeb-enabled sites.

I'm testing my implementation by linking to [Webmention Rocks Test #1](https://webmention.rocks/test/1), which is designed to verify that webmention endpoints can be discovered and that webmentions can be sent correctly.

## What This Tests

According to the webmention.rocks documentation, Test #1 verifies:

- **Endpoint Discovery**: Can my sender find the webmention endpoint advertised in the `<link>` tag?
- **Sending**: Can my sender successfully POST to the discovered endpoint?
- **Proper Format**: Does my sender include the required `source` and `target` parameters?

## Expected Behavior

When webmention.app processes this post from my RSS feed:

1. It should discover that this post links to `https://webmention.rocks/test/1`
2. It should find the webmention endpoint advertised on that page
3. It should send a webmention with:
   - `source`: The URL of this post
   - `target`: `https://webmention.rocks/test/1`

If successful, my webmention should appear on the test page.

## Additional Test Links

I'm also mentioning a few other webmention.rocks test pages to verify comprehensive endpoint discovery:

- [Test #2](https://webmention.rocks/test/2) - Endpoint in HTTP Link header
- [Test #3](https://webmention.rocks/test/3) - Endpoint in HTML `<a>` tag
- [Test #23](https://webmention.rocks/test/23) - Multiple endpoints

This post will help me verify that my webmention sending implementation is working correctly before I start responding to real posts in the IndieWeb community.
