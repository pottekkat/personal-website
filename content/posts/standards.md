---
title: "How Standards Consolidate"
date: 2024-03-11T09:45:45+05:30
draft: false
ShowToc: true
TocOpen: true
ShowRelatedContent: false
summary: "Fortunately, the external access one has been solved now that we've all standardized on the Ingress API. Or is it the Gateway API? Shit."
tags: ["kubernetes", "open source", "standards"]
categories: ["Kubernetes"]
cover:
    image: "/images/standards/comic-banner.jpg"
    alt: "Cartoon drawings."
    caption: "Notes on ~~proliferation~~ consolidation of standards."
    relative: false
---

Every discussion about standards invariably refers to this XKCD comic. This article won't be any different.

{{< figure src="/images/standards/standards-xkcd.png#center" title="Standards (xkcd #927)" caption="Fortunately, the charging one has been solved now that we've all standardized on mini-USB. Or is it micro-USB? Shit." link="https://xkcd.com/927/" target="_blank" class="align-center" >}}

The comic suggests that attempts to fix standards, with even the noblest of intentions, eventually [add to the problem](/posts/gateway-api-v1/#whats-wrong-with-the-ingress-api) instead of offering a solution.

It usually goes like this:

1. A standard emerges to unify different projects/their standards.
2. The unified standard has limitations that implementors want to overcome.
3. Implementations diverge from the standard because of these limitations.
4. Each implementation now has its own standard.
5. A new standard emerges to unify these different standards. _Again._

While this makes it seem impossible to build and maintain standards, the existence of successful standards with wide adoption suggests a different reality; a reality where there are _solid_ reasons why standards fail and succeed.

An example I often use to walk through these ideas is the [Kubernetes Gateway API](#apis) (sorry, non-software engineers! But you **don't** need to know a lot about the API to follow this article). The API’s popularity, novelty (in ideas and recency), and proximity to my work on [Apache APISIX](https://apisix.apache.org/) and related open source projects make it a fine choice.

Having had a front-row seat to witness [how the API evolved](/posts/gateway-vs-ingress-api/#extending-ingress-and-evolution-to-gateway-api) is an added bonus.

As the title suggests, the Gateway API rose from the ashes of a failed [Ingress API](#apis) to consolidate multiple diverging standards. Studying how this was achieved can help future attempts at standardization from the endless _"emerge-limitations-diverge"_ cycle (_am I big enough to name things?_).

## "Standards"

I use the term “standards” conservatively and **only** include _open_ standards. To borrow words from [David A. Wheeler](https://dwheeler.com/dwheeler.html):

{{< blockquote author="David A. Wheeler" link="https://dwheeler.com/essays/opendocument-open.html" title="Is OpenDocument an Open Standard? Yes!" >}}
An open standard is a specification that enables users to **freely choose and switch** between suppliers, creating free and open competition.
{{< /blockquote >}}

[This definition](https://en.wikipedia.org/wiki/Open_standard#Specific_definitions_of_an_open_standard) shines the light on the users, which I believe is the most helpful way to think about standards (think about using Apple Lightning™ vs USB-C or [Custom CRDs](/posts/gateway-vs-ingress-api/#custom-crds--ingress-api) vs Kubernetes Gateway API).

## APIs

APIs are standards for interaction.

The [Ingress API](https://kubernetes.io/docs/concepts/services-networking/ingress/) was created to standardize how external requests are routed to services within a Kubernetes cluster. It was implemented by [around 20 Ingress controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/), which did the actual routing.

The API was independent of its implementations. Users were free to pick any implementation with the Ingress API and switch between implementations.

But it wouldn't last long. The API was limited, and implementations started using custom annotations and developed proprietary standards to support advanced features, which only worked with the specific implementation.

Naturally, implementations started to diverge.

[Gateway API](https://gateway-api.sigs.k8s.io/) tries to learn from the mistakes of its predecessor in an attempt to consolidate these diverging implementations. And it has been doing a fine job so far.

That's all you need to know to understand this article, but if you are looking for more, [I\'ve got you covered](/posts/gateway-vs-ingress-api/).

## Why?

It isn't easy to build and maintain standards. So why do it?

Standards are so ubiquitous that most users don't even realize they're there. It is unlikely that you thought of how HTML evolved as a standard over the last three decades and how it enabled you to read this article through a browser of your choice (this article is [not best viewed](https://oldweb.today/?browser=ns4-mac#http://navendu.me/) with Netscape Navigator 4.0). And I'm just ~~scratching~~ grazing the surface.

But the absence of standards is immediately apparent, and like in the comic, spontaneous efforts at standardization begin to emerge.

For users, standards provide insurance through vendor neutrality, allowing them to switch between vendors without hassle. With the Ingress API, if a user decided to move to a different Ingress controller (implementation), it was as easy as just swapping the controllers.

But why would controller developers adhere to a standard when they can stick to their own APIs? It turns out there are some fundamental market forces at play here:

1. **Reducing costs**: By using and collaborating on existing standards, developers avoid reinventing the wheel and the associated costs (cost-benefit analyses are not only for MBAs).
2. **Market appeal**: Vendors adhering to standards have more appeal to users and have more potential for adoption because of factors like interoperability and portability (but Apple Lightning™ sounds so cool!).
3. **Network effects**: The value of a standard increases as more people use it. Because this isn't a zero-sum game, all players (developers) benefit from the increased value (you have a bigger pool of potential users who can easily switch to your implementation).
4. **Regulatory compliance**: If an external agent, like a government, forces developers to comply with a standard, they are left with no choice. This does not happen often for standards like the Ingress API but for standards like USB-C (EU's policy to enforce USB-C might not have been a good idea. I'm very opinionated on this, but I digress).

The bottom line is that standards benefit developers and users alike.

## When?

Despite these seemingly obvious benefits, the Ingress API failed on many grounds. A lot of it had to do with timing.

Timing your shots to perfection is key to hitting sixes (home runs if you’re American). The same goes for standards.

You either do it too early and curb innovation or be unfashionably late and face inertia from “competing” standards.

In 2015, when the Ingress API was first released, Kubernetes was still in its infancy (and neural networks were more natural). There were also fewer controllers, and the ones that existed didn't really target Kubernetes. In hindsight, it is easy to see this was terrible timing, especially because it involved external implementors (controllers), unlike other Kubernetes APIs.

Fast forward to the late 2020s, Kubernetes was well adopted, and many controllers were mature. With this in place, the Gateway API was undoubtedly better set for adoption.

## Favorite

Standards, by definition, are independent of their implementations. This wasn't necessarily the case for the Ingress API. The official documentation reads:

{{< blockquote author="kubernetes.io" link="https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/" title="Ingress Controllers" >}}
Kubernetes as a project supports and maintains AWS, GCE, and nginx ingress controllers.
{{< /blockquote >}}

The API could be unintentionally biased toward these three controllers when multiple other third-party controllers also support it.

Developers of the Gateway API realized that they shouldn't play favorites and that the only sustainable way to maintain this standard was through collaboration.

## Collaborate

When competition turns into collaboration, everyone wins.

The Gateway API is likely the most collaborative Kubernetes API in terms of the number of contributors and companies (implementations) involved.

The Gateway API also started collaborating with service mesh projects through the [GAMMA initiative](https://gateway-api.sigs.k8s.io/mesh/gamma/), increasing its scope to cover east-west (service-to-service) traffic. This proved successful when Istio announced they would [fully transition to the Gateway API](https://istio.io/latest/docs/setup/additional-setup/getting-started/) in the coming releases.

## Evolve

A consequence of this collaboration was that the Gateway API followed a natural bottom-up evolution instead of a top-down enforcement.

When Ingress wasn't enough, controllers built custom APIs (CRDs) to bridge the gap and provide better user experiences. The Gateway API takes inspiration from these approaches.

Instead of building from scratch, contributors involved in the individual controller projects came together to create the Gateway API, which reasonably fit all their needs.

Individual features in the Gateway API also go through an evolutionary process called [support levels](https://gateway-api.sigs.k8s.io/concepts/conformance/#2-support-levels). There are three support levels:

* **Implementation-specific**: Features that aren't portable, specific to each implementation.
* **Extended**: Portable features that might not be supported by each implementation.
* **Core**: Features supported (or in the roadmap) by all implementations.

Implementation-specific features will gradually evolve into core features when sufficient implementations support them. And even though some features might not be supported by all implementations, they will still be portable if they choose to implement them down the road.

## Adapt

Standards that _adapt_ quickly are adopted.

As the Ingress API was a part of the Kubernetes APIs, it had to go through the same development process as Kubernetes. Its established release cycles made it difficult for contributors to publish changes independently.

Controllers were moving quickly, adding new features for their users that could not be exposed through a limited Ingress API. This was during a period when Kubernetes was generating a lot of excitement, and the Ingress API wasn't cutting it anymore.

Standards that **don't** adapt quickly are discarded.

The Gateway API maintainers avoided this limitation by implementing the APIs as CRDs (custom extensions to Kubernetes). So, even though it is an official Kubernetes API, it is installed and managed separately. More importantly, the Gateway API project is hosted independently and has separate release cycles.

## Survive

Sometimes, a standard penetrates just enough to survive.

This happened with the Ingress API, but the Service Mesh Interface (SMI) specification is a better example.

SMI was similar to the Ingress API but for working with [service meshes](/posts/gateway-and-mesh/) in Kubernetes. The API supported the lowest common denominator of features supported by every service mesh, and every service mesh implementation was expected to support these features.

The API experienced similar hurdles with adoption, but the project survived. In 2021, [I worked with SMI](https://youtu.be/1YZlrij7iV0?si=gzLmfEHVD5JdJfTH&t=129) to run and report conformance tests and found that an increasingly few service meshes maintained their SMI support.

Some projects like Linkerd continued to support SMI, but most others that conformed to initial versions of the spec stopped supporting the spec altogether. The end users lost all tangible benefits of using SMI.

Now that the Gateway API supports service meshes through the GAMMA initiative, I expect [more service meshes](https://gateway-api.sigs.k8s.io/implementations/#service-mesh-implementation-status) to adopt the API, following Istio's lead.

## Translation

English is a global standard for communication. Why else would someone several linguistic steps away from English use it to write an article about standards?

But English was enforced top-down. You couldn't reasonably decide one day that everyone should be speaking Hindi unless you had the resources of a colonial superpower from the 17th century.

But we translate languages. I can read the book "Cien años de soledad" without knowing Spanish by its English translation, "One Hundred Years of Solitude." While translations are hard for natural languages, they are easier for standards written for computers.

Gateway API does this with the [ingress2gateway](https://github.com/kubernetes-sigs/ingress2gateway) CLI tool. It can convert configurations defined with the Ingress API to Gateway API configuration. It can also translate implementation-specific annotations or CRDs to the Gateway API through providers.

I recently wrote a [provider for Apache APISIX](https://github.com/kubernetes-sigs/ingress2gateway/tree/main/pkg/i2gw/providers/apisix).

This is a short-term solution. We won't need this tool in the future because everyone will be using the Gateway API.

## Proliferation

Do standards proliferate? Yes.

Is it inevitable? No.

However, preventing standards from evolving or discarding them in favor of something new would undoubtedly curb development.

Standards should not be seen as bounding boxes to fit into but frameworks to build on. If a new standard is needed for this framework, it must exist.

In a perfect world, standards will inevitably converge. But such worlds exist only in alternate universes.

{{< figure src="/images/standards/standards-np.png#center" title="Standards (pottekkat #1)" caption="Unfortunately, this is an alternate universe." link="/images/standards/standards-np.png" target="_blank" class="align-center" >}}

In imperfect worlds like ours, we write articles pushing for better standards.
