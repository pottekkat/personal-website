---
title: "How I Ask Questions as a Software Engineer"
date: 2021-12-25T11:15:25+05:30
weight: 15
draft: false
ShowToc: false
summary: "I ask a lot of questions to my peers and to strangers on public forums in the internet. This year, I have been trying to improve this process to ask better questions. Here is how I do it."
tags: ["communication", "software engineering", "tips"]
categories: ["Software Engineering", "Featured"]
aliases: [/asking-questions]
cover:
  image: "images/how-i-ask-questions/banner-student-raising-hand.jpeg"
  alt: "Student in classroom raising hand to ask a question"
  caption: "Photo by [National Cancer Institute](https://unsplash.com/@nci?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/indian-classroom?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)"
  relative: false
---

I ask a lot of questions to my peers and strangers on public forums on the internet. This year, I have been trying to improve how I ask questions. Here is how I do it.

But first of all,

## What are Good Questions?

Good questions are the ones that are easy to answer.

Our goal for asking a question is to have the other person explain what they know in a way you can understand. A series of good questions is the key to a good answer.

Bad:

> J: What happens when we strip the binaries? (Too vague and broad)
>
> N: Stripped binaries don’t have debugging information. So its size is reduced ... (Answers with a lot of irrelevant information)

Good:

> J: I see that we are stripping the binaries to reduce their size before publishing. I found that it shouldn’t affect the performance. Is that right? What other implications does this have? (Clear question, easy to answer)

> N: Stripping only removes the debugging information. It wouldn’t affect the performance in any way. But it will be difficult to debug if we run into any issues as debug symbols are removed from the traceback.

## The Problem with Bad Questions

Bad questions can derail a conversation quickly.

For me, asking bad questions has often resulted in:

* the person explaining things irrelevant to my question.

* the person explaining things I have no clue of.

* the person explaining what I already know.

* the person not answering the question at all (especially for under-researched questions).

All of this boils down to you or both of you walking away frustrated and without a clear answer.

At this point, it should be obvious why you should focus on asking questions properly. So, here is my process.

## Who are you Asking?

Who you are asking a question should impact how you ask the question. Let me explain.

If you are asking your coworker who works on your project or is familiar with the particular niche, you can reasonably assume that the person has some context on what you are asking.

This means there would be fewer things to explain, and you can build your explanation from your shared knowledge. But it is a different game when you are asking questions to the people of the interwebs.

When I began programming, I had my share of bashing from people in Stack Overflow. I get that having a high bar for quality assurance helps Stack Overflow be the go-to place to ask questions, but some of the moderators are so trigger-happy that they will shoot you (your question) down right away.

But anyway, the important thing to remember here is that the person reading your question has very little context about your situation. It is obvious when a person has put little to no effort into the question, and these questions are the first to get the bashing.

## When to Ask?

If you have a lot of questions or if you think answering your question will take time, it is better to schedule a time when you are both available.

If your questions are quick, it is better to ask them right away if it saves you a lot of time.

## Google First, Ask Later

One of my biggest pet peeves is people who ask technical questions that can be answered by the first result of a Google search. It shows little effort on their part, and now I just ask people to Google it and do not bother to answer until they do their homework.

> I maintain a project called Meshery, and one of the new contributors (who came in to get a [GSoC internship](https://summerofcode.withgoogle.com/)) literally asked if I could explain what Meshery is.
>
> We have a website, 100+ pages of documentation, recordings of conference talks, and technical documentation, all sent to the user as they join the community.
> 
> You know how that conversation went.
>
> It would have been different if they had asked me something like, “I have been going through Meshery’s docs and been trying it out locally. I’m unclear how Meshery adds value if a person already uses a service mesh. Could you point me to any docs where this is explained better?”.
>
> Think for a moment about how you would have answered in these scenarios.

Doing a bit of research can help you build some foundational knowledge to ask a set of better questions.

The “Google first, ask later” motto is only good as a rule of thumb. Nothing has stopped me from asking obvious, googleable ([it is a real word](https://en.wiktionary.org/wiki/googleable)) questions when in conversation with someone.

To sum it up, make some effort, do your homework, and then ask your questions. Don’t expect to be spoon-fed.

## Is that Right?

Let’s go back to the “stripped binary” example.

> J: I see that we are stripping the binaries to reduce their size before publishing. I found that it shouldn’t affect the performance. Is that right? What other implications does this have?

See how stating what you already know lets you build the rest of the conversation.

To ask this question, you must spend some time digging through what a stripped binary is and how it is different from a “normal” binary. The time taken to understand and formulate that question is time well spent.

On the receiving end, the person will see that you have spent time in this and are not just asking them to do your work. It will also be easier to answer your question by building on your foundational knowledge.

## ~~Vague~~ Precise Questions

> J: How do I use a Kind cluster to set up my development environment?

If you ask me this, I would reply with a link to the Kind docs. But this wasn’t what they intended to ask. So they say,

> J: I tried this, but it is not working.

Well, there are million different reasons for this not to work. I am not Doctor Strange to evaluate all the possibilities in a second! A little bit more context might help.

I will cut to the chase and say how I would ask this question.

> N: I was trying to set up Kind for my local development environment. I am on macOS. I have Docker Desktop and Kind running. I also have set up Metallb LoadBalancer, and I see the external IP of the service, as shown on the logs below. Still, I am not able to reach it from my host machine. Is there something I’m missing?

Then that senior engineer with years of experience can jump right in and say,

> S: On macOS, Docker does not expose the docker network to the host. You can try port-forwarding to reach the pods.

See how easy it was to answer?

This goes for all questions. The more precise you are with your questions, the easier it is to answer.

This also prevents the person answering from going off on a tangent, explaining irrelevant details that you may either not care about or aren’t relevant to your actual question.

Another way to prevent shooting off on a tangent is to ask questions that can be answered by a simple yes/no.

> J: ~~Why are we using this gRPC middleware instead of directly calling the required service?~~ 

>

> J: Are we using this gRPC middleware to convert between two different configuration formats?

> N: Yes.

The person usually goes to explain why yes/no after this, but these questions are easy to answer, and I almost always get quick responses.

These questions are pretty helpful when you are in conversation with a person, and they are explaining something to you. This segues into my next point.

## When in Doubt, Ask More Questions

Imposter syndrome is real.

When I started working with others, I often stopped myself from saying, “I don’t understand”, thinking I would look stupid.

I have then come to learn that if you ask a “stupid” question, you are stupid for the day, but if you don’t, you are stupid for life (because you will always stop yourself from asking questions, ending up not understanding things completely... umm, you get it right?).

This means when you get an answer, and you are not completely satisfied,

* say what you don’t understand.

* ask more clarifying questions.

* stop the speaker and ask more specific questions.

Confronting the imposter syndrome is hard, but it has been helpful to me in knowing that [everyone else faces this too](https://www.ted.com/talks/elizabeth_cox_what_is_imposter_syndrome_and_how_can_you_combat_it).

When you start thinking, “maybe I’m just not smart enough to understand the answer”, remember that people want to help you. You just have to help them help you!

## Learning in Public

Ask questions in a public channel instead of DMs.

This may not work in every situation, but I try to do this more often now.

This will document the discussions publicly and would also help any others looking in. You can always point people to this discussion if they ask the same question.

Take Stack Overflow, for example. You almost always find answers to problems you face from questions someone else asks.

The imposter syndrome shifts to the next gear here. Face it head-on.

## Asking Good Questions is a Skill

And like all skills, it is sharpened with practice.

Asking the right questions will help you extract the answers you want. In most scenarios, it is not that the person answering is incapable, but you are not asking the right questions.

I have improved over the year and am still working out the kinks in my process.

_This might be a good post to come back to in a year to reflect on and improve._

To summarise this post in a sentence,

_Make it easy for people to help you._
