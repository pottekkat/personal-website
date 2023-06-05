---
title: "Notes on the Digital Personal Data Protection Bill"
date: 2023-06-05T18:05:11+05:30
draft: false
ShowToc: false
ShowRelatedContent: false
summary: "Semi-ordered thoughts on the new Digital Personal Data Protection Bill by the Indian Government."
tags: ["data", "public policy", "notes"]
categories: ["Public Policy"]
cover:
    image: "/images/dpdpb/red-robot-banner.jpg"
    alt: "Abstract image of a robot and red Lego-like bricks."
    caption: "Photo by [rishi](https://unsplash.com/@beingabstrac) on [Unsplash](https://unsplash.com/photos/WiCvC9u7OpE)"
    relative: false
---

> **Disclaimer**: I am still learning about public policy and base this blog post on my current understanding of the topic. I will continue improving this post as I learn more. Any feedback and corrections are welcome.

I'm still trying to figure out what to make of the new [Digital Personal Data Protection Bill](https://www.meity.gov.in/writereaddata/files/The%20Digital%20Personal%20Data%20Potection%20Bill%2C%202022_0.pdf) (DPDPB).

I thought it was a great idea when I was introduced to the bill last year. I was familiar with [GDPR](https://gdpr-info.eu/) and considered the bill an Indian version of the GDPR (Desi-DPR™?). Users in the EU have generally responded to the GDPR positively, and I believed the bill would just be like that.

It was only in February when I actually read through it ([had someone read it to me](https://www.youtube.com/watch?v=4VMUl3z85Gw)). It did not change what I thought the impact of the bill would be, but it made me realize two things:

1.  The bill is super easy to read, and it wasn't a whole lot of legal jargon like I expected.
2.  I could learn more about policymaking and be analytical about policies impacting technology.

I ended up reading the bill and opinions about the bill from organizations like [Internet Freedom Foundation](https://internetfreedom.in/read-our-consultation-response/) and [Software Freedom Law Center](https://sflc.in/recommendations-sflcin-digital-personal-data-protection-bill-2022/), media outlets, and public discourse. Everyone seems to agree that the bill got a lot of things right, but there are still a lot of unaddressed concerns.

I also started learning more about policymaking and policy analysis and wanted to write about my opinions on the bill.

Originally I planned to write multiple articles with these ideas:

-   Comparing DPDPB and GDPR.
-   How DPDPB could affect tech companies.
-   Explaining DPDPB through illustrations.
-   Concerns in DPDPB.

But the more I look into it, the more I find it difficult to form a comprehensive opinion. So here are my fragmented notes on the bill, which you can (don't) use to develop your own opinions.

## Unchecked Power

The provisions in the bill do not apply to government instruments (and, by extension, private agents) in certain situations the Union Government sees fit. These situations are described vaguely in the bill opening up the potential for misuse by the Government and can lead to a violation of the fundamental right to privacy.

The Data Protection Board (DPB), which will be established through the bill, is also not an independent body. But the independent operation of the DPB is needed to ensure proper adherence to the bill.

## Laws Should Protect People (?)

The goal of this bill is to protect people's privacy, but the general consensus among people who have read the bill is that it actively fails to do so.

The concept of deemed consent, where the Data Principal (DP) is assumed to have given consent for the Data Fiduciary (DF) to collect and use their personal data, can be problematic, especially when the DF is the Government. Furthermore, the conditions for deemed consent are also vague, defeating the bill's purpose.

The bill also imposes fines on the DF and the DP for failing to adhere to the bill. These fines imposed on the DF will be collected by the Government, and the bill does not mention any relief to DP who are affected by this failure. Also, fines on DPs? What?

## Incomplete Laws

The bill misses things when we compare the DPDPB with the EU's GDPR. 

For example, the bill isn't clear on transferring personal data outside India even though the bill applies to the personal data of Indian citizens processed outside India.

The GDPR has data localization rules and allows data to be transferred to other countries only if a certain security level is guaranteed. Compared to the GDPR, the bill does not lay down rules concretely and leaves much room for existing systems and regulations to work.

## New Tech

DFs must notify DPs in every language listed in the Eight Schedule to the Constitution of India. The bill also allows DPs to have a Consent Manager (CM) to give, manage, review, or withdraw their consent from the DFs. 

MeitY has already [provided a specification](https://dla.gov.in/sites/default/files/pdf/MeitY-Consent-Tech-Framework%20v1.1.pdf) for the CMs to adhere to, meaning existing platforms like Android, iOS, and Windows could use this specification to act as the CMs and mediate decisions regarding the use of personal data between the DPs and the DFs.

These CMs should be registered with the DPB and accountable to the DPs.

Even if the DP has given consent before the bill's implementation, DFs must provide notice to the DPs about how they have used their personal data. DFs also have to make withdrawing consent as easy as giving it. Once the need for a DP's personal data is no longer needed, the DFs must remove the data.

DFs are also required to set up organizational and technical measures to adhere to the bill. The Government can also declare DFs as Significant Data Fiduciaries (SDFs) based on certain criteria. SDFs are also required to appoint a Data Protection Officer (DPO) and an independent Data Auditor to evaluate compliance with this bill.

The bill also prevents DFs from monitoring children's behavior or direct targeted advertisements at children (unless Government allows it?).

## Amateur Hour

I'm still not experienced enough to understand many of the bill's implications. I hope to converse with more people better equipped to speak about this in the future and update my opinions.

These notes are incomplete, and I meant to publish them in this unfinished state. I would like to see how my view changes as I learn more and as the bill (hopefully) undergoes changes.
