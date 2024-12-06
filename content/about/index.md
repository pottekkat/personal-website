---
title: "About"
url: "/about/"
layout: "about"
description: "About Navendu Pottekkat and his blog."
ECharts: "echarts.min.js"
---

Welcome to "The Open Source Absolutist."

## About This Blog

A justifiable definition of this blog would be "a sliding window into my obsessions." And I have _a lot_ of obsessions.

At present, these obsessions and the contents of the blog include but are not limited to the following:

1. Building sustainable [open source](/categories/open-source/) projects and communities.
2. Advocating for [better policies](/categories/public-policy/), especially the ones surrounding the use of technology.
3. Navigating life as [twentysomethings](/categories/life/), exploring roads less taken.

This blog also contains [tutorials for open source projects](/tags/apache-apisix/), [unedited daily ramblings](/dailies/), and an [occasional newsletter](/newsletters/).

Unless mentioned otherwise, all material in this blog is licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0), and the [source code](https://github.com/pottekkat/personal-website) of this website is available under the [MIT license](https://github.com/pottekkat/personal-website/blob/hugo/LICENSE).

### Ethics Statement

I don't accept any form of payment to write about a product or a company. The products I write about are the ones I work on and/or believe in strongly.

I use [analytics](/stats/) to help me learn and improve my future articles. This blog uses [Plausible Analytics](https://plausible.io/privacy-focused-web-analytics) and does not collect personal data or personally identifiable information.

## About Me

Quick links: [featured posts](/categories/featured/), [talks](https://youtube.com/playlist?list=PLUVkO7d15olRgs1rU6scvszk0DB5HxKdu), [what am I doing now?](/now/)

It's hard to compress yourself into a couple of sentences. You should try.

Since this blog is called "The Open Source Absolutist," it wouldn't be surprising to learn that I'm indeed an open source absolutist. Most, if not all, of the code I write, have written, and will write is, was, and will be open source. I'm also an advocate for open education, research, healthcare, markets, and governance.

I [actively maintain](https://github.com/pottekkat) open source projects, including projects hosted by the Apache Software Foundation and the Cloud Native Computing Foundation. At present, my primary focus is on sustainable open source.

I'm also learning about economics and public policy and using my background in engineering to advocate for better policies, especially policies surrounding technology. I'm an amateur at best, and that's okay because the word "amateur" comes from the Latin amare, which means "to love."

_The chart below shows how much I work on this blog. See more [/stats](/stats/)._

{{< echarts title="Stats from the last year" caption="GitHub inspired contribution graph" width="720px" height="120px" overflow="auto" setOption=false class="nofill" >}}
var chartColor = ["#c6e9e3", "#317f72"];

if (!document.body.classList.contains("dark")) {
chartColor = ["#e8b98a", "#c34052"];
}

fetch("commitsData.json")
.then((response) => response.json())
.then((data) => {
const startDate = data[1][0];
const endDate = data[data.length - 1][0];

    const option = {
      animation: false,
      calendar: {
        left: 38,
        top: 24,
        right: 8,
        cellSize: 12,
        range: [startDate, endDate],
        splitLine: {
          show: false,
        },
        itemStyle: {
          color: "rgba(0,0,0,0)",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 2
        },
        dayLabel: {
          color: "currentColor",
          fontSize: 14,
          nameMap: ["", "Mon", "", "Wed", "", "Fri", ""]
        },
        yearLabel: {
          show: false,
        },
        monthLabel: {
          color: "currentColor",
          fontSize: 14,
          nameMap: [
            "Jan",
            "",
            "Mar",
            "",
            "May",
            "",
            "Jul",
            "",
            "Sep",
            "",
            "Nov",
            "",
          ],
        },
      },
      visualMap: {
        min: data[0] + 1,
        max: 100,
        inRange: {
          color: chartColor,
        },
        splitNumber: 10,
        show: false,
        //   itemSymbol: "circle",
      },
      series: {
        type: "heatmap",
        coordinateSystem: "calendar",
        symbolSize: function (val) {
          // Use the natural logarithm of the value to achieve logarithmic scaling
          return Math.log(val[1]) * 3;
        },
        data: data.slice(1),
      },
    };
    myChart.setOption(option);

})
.catch((error) => console.error("Failed to load commit data:", error));
{{< /echarts >}}

I spent most of my adult life trying different things. I have built embedded systems for nuclear reactors, installed solar panels on homes across central Kerala, maintained personal and commercial open source software, traveled to different countries, met countless people, and slept at airports (Changi airport is my favorite). I want to try more.

Outside of this, I enjoy reading, playing my bass, and riding my motorcycles. If you want to know more about me, here's [my story](/story/).

### Travel

The only reason I haven't traveled more in the last few years is because my passport sucks. It takes a lot of effort to apply for a visa, and I'm under a lot of stress after I submit my visa application, waiting to know if I can travel.

My European, American, and Singaporean friends have relentlessly heard me rant about this. I don't plan to stop because it is the most limiting thing in the modern world and probably one of the only reasons I envy people in rich countries with better passports.

Still, I have traveled to all these countries, and I plan to keep traveling: 🇸🇬 🇨🇳 🇦🇪 🇱🇰 🇮🇪 🇧🇭 🇲🇾 🇹🇼 🇮🇩 🇲🇻 🇻🇳 🇦🇹 🇸🇰 🇭🇺 🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇬🇧

I have yet to go to a lot of places in India (next year 🤞). And I have traveled to all districts in Kerala.

## Contact

You can reach out to me at [navendu@apache.org](mailto:navendu@apache.org)

### GPG Key

To encrypt messages, please use my public key:

```text
-----BEGIN PGP PUBLIC KEY BLOCK-----

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
cqpue0I=
=oMN2
-----END PGP PUBLIC KEY BLOCK-----
```

You can verify my public key using my fingerprint:

```text
0D34 FAA1 5D04 4F67 1CCB  741D DE0F 662B 8EBB DAB4
```

