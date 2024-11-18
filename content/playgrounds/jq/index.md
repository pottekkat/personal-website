---
title: "jq Playground"
description: "Learn to transform JSON with jq."
summary: "A playground for jq."
date: 2024-11-25T20:21:51+05:30
experimental: true
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
cover:
  image: "/images/pl-jq/json-logo-banner.jpg"
  alt: "JSON logo."
  relative: false
  hidden: true
---

Welcome to the jq playground! This sandbox is designed to help you try out [jq](https://jqlang.github.io/), a powerful tool for working with JSON.

First, add your JSON data to the `data.json` file below:

```json {id="data.json"}
{
  "store": {
    "books": [
      { "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 10.99, "genre": "fiction" },
      { "title": "Clean Code", "author": "Robert C. Martin", "price": 38.95, "genre": "non-fiction" },
      { "title": "The Pragmatic Programmer", "author": "Andrew Hunt", "price": 42.99, "genre": "non-fiction" },
      { "title": "1984", "author": "George Orwell", "price": 8.99, "genre": "fiction" }
    ],
    "music": [
      { "artist": "The Beatles", "album": "Abbey Road", "price": 19.99, "genre": "rock" },
      { "artist": "Miles Davis", "album": "Kind of Blue", "price": 15.49, "genre": "jazz" }
    ]
  }
}
```

{{< codapi sandbox="jq" editor="basic" hidden=true >}}

Then create jq filters and see the response:

```shell
jq '
.store | 
{
  "summary": (
    [.books[], .music[] | select(.price <= 20)] |
    group_by(.genre) |
    map({
      genre: .[0].genre,
      total_items: length,
      total_price: map(.price) | add
    })
  )
}' data.json
```

{{< codapi sandbox="jq" editor="off" files="#data.json" >}}

To learn how to use jq, see this [interactive tutorial](/posts/jq-interactive-guide/).
