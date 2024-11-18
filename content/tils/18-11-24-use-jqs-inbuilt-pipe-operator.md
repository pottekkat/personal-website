---
title: Use jq’s Inbuilt Pipe `|` Operator
date: 2024-11-18T13:46:00+05:30
description: jq has an inbuilt pipe operator that can replace the default shell pipe.
fmContentType: TILs
---

When combining multiple jq filters, you can use jq's inbuilt pipe `|` operator instead of shell pipes.

i.e., instead of this:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'.[]' | jq 'select(.address.city == "South Christy")' | jq '{name, username, email}'
```

You can do this:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'.[] | select(.address.city == "South Christy") | {name, username, email}'
```
