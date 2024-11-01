---
title: 'Rug Pulls, Comic Sans, and "Link in Bio"'
date: 2024-05-20T16:30:26+05:30
draft: false
ShowToc: true
TocOpen: true
summary: "Rug pulls from big tech are inevitable."
tags: ["newsletter"]
categories: ["Newsletter"]
---

Have you noticed that this is a link-only newsletter?

Each issue is basically a collection of links to other pages on the internet that I find interesting.

Ironically, this turned into a fight against the modern internet, which has shriveled to five websites, where sharing links—the bridges that make the internet highway possible—is discouraged or outright banned. [Anil has summarized](https://www.anildash.com/2019/12/10/link-in-bio-is-how-they-tried-to-kill-the-web/) what's wrong with this "link-in-bio-internet" in his excellent essay.

It's unintentional, as I'm in this fight primarily because of the limitations of my current newsletter setup, which cannot ensure that whatever I put into an issue is delivered correctly to your inboxes. The link-only rule ensures that what you read is what I intended.

However, I have concluded that this constraint helps me write better issues and bring more value to my readers. It's a stretched-out version of "it's a feature, not a bug."

## What's Happening?

We cannot seem to go a week without any OpenAI drama.

This time, it's [cryptic messages on Twitter](https://x.com/OfficialLoganK/status/1790604996641472987) from former and departing employees. These messages fail to shed light on anything except have the drama bees buzzing.

I would think a company supposedly trailblazing the path to superintelligence would be more stable, but that seems far off for Sam Altman and his company.

Google managed to join the race to superintelligence with some new announcements at the [Google I/O conference](https://www.youtube.com/watch?v=xKmEOXZsU_0). If anyone can catch up with OpenAI, it's Google, and if anyone is better positioned to be the leader of the AI race, it's Google.

Another area where big tech companies fare well is rug pulls.

Rug pulls are becoming an epidemic in big tech companies. They are more driven by their spreadsheets than actual customers. Meta recently [pulled the plug on Workspace](https://techcrunch.com/2024/05/14/meta-is-shutting-down-workplace-its-enterprise-communications-business/), their enterprise communication app, to "focus more on AI and the metaverse."

As [DHH points out](https://world.hey.com/dhh/meta-is-shutting-down-workplace-3e24bca5), this should make people question the norm of trusting a big company over a small one. Small companies and niche products need your business to survive, while the big ones have tons of money-generating funnels to rely on. They corner the market, jack up the prices, and when the profits aren't good, they just as quickly pull the rug, leaving you stranded.

[Another article from DHH](https://world.hey.com/dhh/open-source-is-neither-a-community-nor-a-democracy-606abdab) talks about open source users and how they sometimes feel entitled to control the project's direction. The Apache Software Foundation, where I contribute the most, handles this well, where only the maintainers have the final say in project governance.

A [recent study](https://www.aquasec.com/blog/github-repos-expose-azure-and-red-hat-secrets/) shows that employees from Microsoft and RedHat accidentally revealed company secrets and credentials in their side projects. As you would imagine, this opened the door to many vulnerabilities.

It is simple: store your secrets in a file instead of directly in code; don't commit that file to GitHub. Also, you might be better off not using company credentials on personal projects.

If you think these employees had it bad, you [haven‘t heard](https://cabel.com/2024/05/16/the-forged-apple-employee-badge/) about the guy who bought a fake Apple employee badge from the 70s, thinking he was buying a piece of history.

## Curated Links

Boy, do I have a lot for you this week:

- **[Proof by “this feels right“](https://www.youtube.com/watch?v=S75VTAGKQpk)**: John Conway hilariously proves that "91" is the smallest number that appears to be a prime but isn't. While this is a joke, it is interesting to see how our intuitions work and how we model things based on feelings.
- **[The ARM chip race is getting wild](https://www.youtube.com/watch?v=TsKHjFeonRE)**: Tech companies are in a new race to build the best ARM-based chips. It would be interesting to see what will happen to the global semiconductor industry and its implications in geopolitical power struggles.
- **[Comic Sans fixes this](https://x.com/astuyve/status/1788211244068979006)**: It is reaffirming to learn that others run into trivial errors and spend hours debugging. But this one is wild and pretty easy to miss. Comic Sans apparently has its uses.

- **[I made a Fallout inspired RPG game in EXCEL](https://www.youtube.com/watch?v=jh-42-7L7B0)**: This video exemplifies why I love people on the internet. The amount of work needed to pull off something like this is monumental. There is absolutely no reason for someone to build this apart from the sheer fun you get from doing it.

- **[The oxygen mask approach to open source](https://lesley.pizza/oxygen-mask-approach-to-open-source/)**: "Open source isn't about contributing to every single damn thing until you pass out and die." I have been thinking about this since one of my personal open source projects started regaining traction recently. I don't have time to add these features now, but I'm okay with it.

- **[No Web Without Women](https://nowebwithoutwomen.com/)**: This excellent web page showcases the historical impact women have had over the years on the development of the web and the field of computer science. Computer science would be a lot different if it weren't for these pioneers.

- **[Bullying Is a Massive Security Vulnerability](https://www.404media.co/xz-backdoor-bullying-in-open-source-software-is-a-massive-security-vulnerability/)**: It's great that the industry is more concerned about the health of open source projects and their maintainers. This article talks about maintainer burnout in light of the XZ Utils backdoor incident and how this isn't just a one-off incident. More such vulnerabilities could already be in the software we use.

- **[Exploring Hacker News for fun](https://blog.wilsonl.in/hackerverse/)**: This interesting exploration uses semantic vector embeddings to map the entirety of Hacker News. I love these visualizations; they unearth many interesting stories about how we look at things. It is also a technically interesting work that is fun to explore.

- **[Golang Error Handling Isn\'t ACTUALLY Bad](https://www.youtube.com/watch?v=OpXBERpnzPE)**: This might be personal. I have been called a Golang Absolutist by my colleague, and I have learned to embrace my absolutism. The beef most people have with Golang includes how it handles errors: the famous `if err != nil` blocks. But when done right, this offers a lot of flexibility in handling errors. Fun fact: I recently contributed to Kubernetes Gateway API to improve how it handles some errors.

- **[How to get 7th graders to smoke](https://www.experimental-history.com/p/how-to-get-7th-graders-to-smoke)**: One of the most important things I have learned while learning about public policy is how seemingly innocent initiatives can often lead to drastic unintended consequences. This study uncovers how some drug prevention programs actually increased drug use among students compared to "doing nothing." I have sat in many of these classes and have often wondered if it helps. Well, it can help the dealers.

- **[Visualizing algorithms for rate limiting](https://smudge.ai/blog/ratelimit-algorithms)**: I'm increasingly convinced to fully invest in creating visualizations and interactions while teaching things in my blog. This excellent interactive visual article explores different rate-limiting algorithms. It is by far the best content on the topic.

- **[I Redesigned Wikipedia JUST to MAKE IT MONEY](https://www.youtube.com/watch?v=Bzj7u4Q5GG0)**: I almost binged the whole channel last week from this rabbit hole of a video. As someone who thinks a lot about developer experience, I'm fascinated by how simple design changes foster new interactions that encourage very different behaviors from users.

- **[Writing Logic in CSS](https://dev.to/iamschulz/writing-logic-in-css-3ig0)**: I have a high appreciation for frontend engineers. Writing code on the backend with API and CLI interfaces is one thing, but it is an entirely different feat to craft user experiences. My appreciation only grows as I tweak my website, learning and discovering new CSS tricks along the way.

## Hot off the Press

The most popular page on my blog got an overhaul last week.

**Read here**: "[20+ Open Source Internship Programs (Updated for 2024)](https://navendu.me/posts/open-source-internship-programs/)"

The monsoons are starting in Kerala, and it calls for a lot of reading time. This means I will have a lot to share with you in the next few issues. Or I might be curled up with a book; I never know.
