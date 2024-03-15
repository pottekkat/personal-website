---
title: "Wasn't Nginx Free?"
date: 2024-03-15T19:53:05+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "A postmortem on the Freenginx announcement."
tags: ["nginx", "commentary", "security"]
categories: ["Commentary"]
cover:
    image: "/images/freenginx/handcuffs-banner.jpeg"
    alt: "Broken handcuffs."
    caption: "Should we [Freenginx](https://freenginx.org/)?"
    relative: false
---

In an [email to the Nginx development mailing list](https://mailman.nginx.org/pipermail/nginx-devel/2024-February/K5IC6VYO2PB7N4HRP2FUQIBIBCGP4WAU.html) on 14 February, core [Nginx](https://nginx.org/) maintainer and former [F5](https://www.nginx.com/) employee [Maxim Dounin](https://mdounin.ru/) announced that he will "no longer participate in Nginx development as run by F5" and instead work on a new aptly named fork called [Freenginx](https://freenginx.org/), which will be "free from arbitrary corporate actions."

He also shares his reasons behind the decision:

1. Non-technical managers from F5 ("who think they know better") are attempting to run the project.
2. These managers decided to interfere with Nginx's [security policy](https://nginx.org/en/security_advisories.html), ignoring his interest (he is the core maintainer).
3. They are driven by marketing and do not consider the developers and the community.
4. This situation contradicts his agreement with F5 to continue his role as a core Nginx maintainer after he left F5 ([after F5 left Moscow](https://my.f5.com/manage/s/article/K59427339) after Russia invaded Ukraine).
5. He no longer controls the changes made in Nginx and no longer sees Nginx as a "free and open source project maintained for the public good" (*ahem*, the chart).

{{< figure src="/images/freenginx/web-server-usage.png#center" title="Usage Statistics of Web Servers" caption="Data source: [Web Servers Historical Usage Trends Report](https://w3techs.com/technologies/history_report/web_server)" link="/images/freenginx/web-server-usage.png" target="_blank" class="align-center" >}}

Reading just this email can tilt our biases in favor of Maxim—something about the term "corporate" instantly flicks the hate switch (strong, but you get the idea).

But the problem is a bit more nuanced.

## Security Policy Interference

In early February, [two security vulnerabilities were discovered](https://mailman.nginx.org/pipermail/nginx-announce/2024/NW6MNW34VZ6HDIHH5YFBIJYZJN7FGNAV.html) in Nginx's HTTP/3 implementation. Per policy, the Nginx developers at F5 disclosed these vulnerabilities and issued two CVEs, [CVE-2024-24989](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-24989) and [CVE-2024-24990](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-24990).

Maxim wasn't happy. He wanted to treat these issues as normal bugs as Nginx's HTTP/3 implementation was still considered experimental.

When a CVE is reported, downstream users of Nginx will have the additional burden of patching this issue. So, users generally appreciate vendors who try to minimize CVEs. Maxim's stance addresses this concern.

However, F5's decision to issue CVEs and report the vulnerabilities to their users was also with similar intent. As one [F5 employee comments](https://news.ycombinator.com/item?id=39378523) on Hacker News (paraphrased for clarity):

> We know many users have the feature in production, experimental or not, which was part of the decision-making process. The security advisories we published state that this feature is experimental.
>
> When in doubt, do right by your users.

When in doubt, do right by your users. But who decides what's right?

## For-Profit Open Source

Maxim's second concern was F5's "corporate control" over Nginx.

This could explain why he made a new fork instead of joining [Angie](https://github.com/webserver-llc/angie), an earlier Nginx fork created by Russian F5 employees when they moved out of Moscow. Angie is now owned by [Web Server LLC](https://wbsrv.ru/), a for-profit company.

It is easy to point fingers at a company for "making money off of open source," but it is also a bit naive.

Sustaining open source projects at scale solely through [recriprocative acts of altruism](https://world.hey.com/dhh/the-open-source-gift-exchange-2171e0f0) is difficult, if not impossible. It often ends with the maintainer unable to make money.

Money buys food, shelter, and medicine (and the occasional life-size poster of Ryan Gosling and happiness).

The open core model, [followed by F5](https://www.f5.com/company/news/press-releases/f5-doubles-down-on-commitment-to-open-source) and previously Nginx (the commercial company), is a good middle ground between pure altruism and corporate selfishness. While F5 makes profits, Nginx remains free and open source.

Economics.

## Who's Right?

Both Maxim and F5 want what's best for their users.

As F5, you are obligated to report security issues to your users, but as Maxim, your obligation is to reduce the burden on your downstream users.

Regardless of who's right, there is a Freenginx fork, and it is maintained by one of the most significant contributors to Nginx.

So, wait and watch how it unfolds?
