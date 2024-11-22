---
title: An Interactive Guide to Transforming JSON with jq
slug: jq-interactive-guide
date: 2024-11-22T11:17:51+05:30
draft: false
toc:
  show: true
  open: true
ShowRelatedContent: false
description: Learn to use jq through incremental, interactive examples right in your browser.
summary: jq is a powerful tool for working with JSON. This guide teaches you to use jq effectively through hands-on, interactive examples running right in your browser.
EnableCodapi: true
CodapiURL: codapi.navendu.me/v1
ShowCodeCopyButtons: false
tags:
  - interactive
  - tutorials
categories:
  - Tutorials
cover:
  image: /images/jq-interactive-guide/prism-banner.jpg
  alt: Prism splitting white light into its component colors.
  caption: Learning to use jq even a little bit can give you tremendous JSON superpowers.
  relative: true
fmContentType: Post (default)
---

jq is a command line tool for working with JSON. Like JSON, jq is ubiquitous, as it comes installed in most Linux distributions, and you would have at least used it to pretty print a JSON file or response:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq
```

{{< codapi sandbox="jq" editor="off" >}}

But jq can do more. _Much more_. jq is on every "five command line tools to learn as a developer" video on YouTube. The Primagen even calls it the BEST CLI tool.

{{< blockquote author="The Primeagen" link="https://www.youtube.com/watch?v=n8sOmEe2SDg" title="The BEST CLI Tool" >}}
Using jq has been the one of the most useful things I have done in a long time.
{{< /blockquote >}}

In this interactive guide, I will show how you can use jq to do everything from pretty printing JSON to transforming JSON using filters like:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'.[] | select(.address.city == "South Christy") | {name, username, email}'
```

{{< codapi sandbox="jq" editor="basic" >}}

Or go to the [jq Playground](/playgrounds/jq/) instead.

## Install jq

This guide lets you to edit and run jq filters directly in your browser. However, if you'd like to follow along on your machine, you can instead install jq.

[jq is available](https://jqlang.github.io/jq/download/) on most package managers. You can also download the binary directly or build it from source.

To verify the installation, run:

```shell
jq --help
```

{{< codapi sandbox="jq" editor="off" >}}

## Basic Filters

### Identity Filter

The most basic filter in jq is the [identity filter](https://jqlang.github.io/jq/manual/#identity) `.`, which represents the current JSON object. It's the default filter in jq and returns the input JSON unchanged:

```shell
echo '{"id": 1,"name":"Leanne Graham","website":"hildegard.org"}' | jq '.'
```

{{< codapi sandbox="jq" editor="basic" >}}

Notice how jq pretty prints the JSON.

> **Tip**: You can edit these commands. Try editing the above command to see the output without the jq filter.

jq can also apply filters directly to a file (`user.json`):

```json {id="user.json"}
{
  "id": 1,
  "name": "Leanne Graham",
  "website": "hildegard.org"
}
```

{{< codapi sandbox="jq" editor="basic" hidden=true >}}

```shell
jq '.' user.json
```

{{< codapi sandbox="jq" editor="off" files="#user.json" >}}

Another common usage is to pipe JSON responses from `curl` commands to jq:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq '.'
```

{{< codapi sandbox="jq" editor="off" >}}

### Access Specific Fields

You can access specific fields from JSON objects using the [object index filter](https://jqlang.github.io/jq/manual/#object-index). Try editing the filter below to access different fields from the JSON object:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq '.name'
```

{{< codapi sandbox="jq" editor="basic" >}}

#### Access Nested Fields

Similarly, you can also access nested fields:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq '.address.zipcode'
```

{{< codapi sandbox="jq" editor="basic" >}}

Try accessing the latitude (`lat`) from the object.

### Filter JSON Arrays

JSON arrays commonly represent a list of objects. To access an object at a specific index, use the [array index filter](https://jqlang.github.io/jq/manual/#array-index):

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq '.[0]'
```

{{< codapi sandbox="jq" editor="basic" >}}

The above example gets the first object from the array. Try changing the index to get the other objects.

> **Note**: Similar to most programming languages, array indexes start at 0 in jq.

#### Slice JSON Arrays

You can also slice an array into a subarray. For example, you can get the objects from index 3 to 6 (excluding) in a subarray using the [array slice filter](https://jqlang.github.io/jq/manual/#array-string-slice):

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq '.[3:6]'
```

{{< codapi sandbox="jq" editor="basic" >}}

> **Tip**: You can specify only the start or end of a slice:
>
> ```shell
> curl 'https://jsonplaceholder.typicode.com/users' | jq '.[:4]'
> ```
>
> {{< codapi sandbox="jq" editor="basic" >}}
>
> You can also specify a negative index to select from the end:
>
> ```shell
> curl 'https://jsonplaceholder.typicode.com/users' | jq '.[-6:-3]'
> ```
>
> {{< codapi sandbox="jq" editor="basic" >}}
>

### Iterate JSON Arrays

Instead of accessing a single object or a slice from the array, you can use the [array value iterator filter](https://jqlang.github.io/jq/manual/#array-object-value-iterator) to iterate over the entire array. For example, to list the details of all users:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq '.[]'
```

{{< codapi sandbox="jq" editor="basic" >}}

This is useful when you, say, want to get just the names of all users:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq '.[].name'
```

{{< codapi sandbox="jq" editor="basic" >}}

> **Tip**: The `-r` flag outputs raw strings without quotes.

## Construct Objects and Arrays

You can also create JSON objects and arrays with custom fields. This is useful when you only care about specific fields and want to omit others.

### Construct New JSON Objects

For example, if you only want the name, email, and company of a user, you can [construct a new object](https://jqlang.github.io/jq/manual/#object-construction) using `{}` with only those fields:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq \
'{"name": .name, "email": .email, "company": .company.name}'
```

{{< codapi sandbox="jq" editor="basic" >}}

Notice how we created a new `emailAddress` property.

### Construct New JSON Arrays

Similarly, you can construct a new array of objects using `[]`:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'[.[] | {"name": .name, "emailAddress": .email, "company": .company.name}]'
```

{{< codapi sandbox="jq" editor="basic" >}}

But what's `|`?

## Combine Filters

The pipe operator `|` feeds the left filter's output to the right filter's input. In the last example, we first use the filter `.[]` to get the array, and then the filter `{"name": .name, "emailAddress": .email, "company": .company.name}` to construct a new array.

We have also been combining filters from the beginning. For example, when we access nested fields like this:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq '.address.zipcode'
```

We are actually combining two filters:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq '.address | .zipcode'
```

{{< codapi sandbox="jq" editor="basic" >}}

## Use Functions

jq comes built-in with handy functions that can do a lot of different things.

### Get Length

The [length function](https://jqlang.github.io/jq/manual/#length) returns the length of a value:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq '.name | length'
```

{{< codapi sandbox="jq" editor="basic" >}}

The below example gets the length of each comment in a post:

```shell
curl 'https://jsonplaceholder.typicode.com/posts/1/comments' | jq \
'.[].body | length'
```

{{< codapi sandbox="jq" editor="basic" >}}

### Get Keys

Another useful function is the [keys function](https://jqlang.github.io/jq/manual/#keys-keys_unsorted). As you might have already guessed, it returns the keys of an object in an array:

```shell
curl 'https://jsonplaceholder.typicode.com/users/1' | jq '. | keys'
```

{{< codapi sandbox="jq" editor="basic" >}}

Notice how the keys are sorted alphabetically in the output. You can use the [keys_unsorted function](https://jqlang.github.io/jq/manual/#keys-keys_unsorted) instead to preserve the order.

### Map Filters

The [map function](https://jqlang.github.io/jq/manual/#map-map_values) `map(f)` applies the filter `f` to each value of an input array or object. The example below shows how a filter is mapped to the entire array of objects:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'map({name: .name, city: .address.city})'
```

{{< codapi sandbox="jq" editor="basic" >}}

Here's a better example using a more helpful map. This map will create a "slug" from a user's name and their city:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'.[:3] |
map({name: .name, city: .address.city, slug: ((.name + "-" + .address.city |
gsub(" "; "-") |
ascii_downcase))})'
```

{{< codapi sandbox="jq" editor="basic" >}}

The [gsub function](https://jqlang.github.io/jq/manual/#gsub) is a built-in function that's used for substitutions. Here, we replace empty spaces with `-` in the slug. The [ascii_downcase function](https://jqlang.github.io/jq/manual/#ascii_downcase-ascii_upcase) then converts the slug to lowercase/downcase.

jq has even [more built-in functions](https://jqlang.github.io/jq/manual/#builtin-operators-and-functions) that cover a wider array of use cases. I will leave it up to you to explore.

### Select Values

The [select function](https://jqlang.github.io/jq/manual/#select) is, by a mile, the most useful feature in jq, at least for me. It does what it says: select based on the values of fields.

For example, you can select only the users whose city is "South Christy":

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'.[] | select(.address.city == "South Christy") | {name, username, email}'
```

{{< codapi sandbox="jq" editor="basic" >}}

The output shows only a single user whose city is "South Christy." Try using the select function on other JSON.

## Transform JSON

In this interactive tutorial, we incrementally built our JSON wrangling skills using jq. Like all command line tools, you build up your skills with practice. You will progressively improve and become a better developer with jq in your arsenal.

So far, we have only managed to scratch the surface of what's capable with jq. But the part we scratched is a good foundation to learn more and do stuff like:

```shell
curl 'https://jsonplaceholder.typicode.com/users' | jq \
'group_by(.address.city) |
map({
  city: .[0].address.city,
  user_count: length,
  users: [.[] | {
    name: .name,
    username: .username,
    slug: (.username + "-" + (.address.city))
  }]
})'
```

{{< codapi sandbox="jq" editor="basic" >}}

The utility of jq scales with the size of the JSON. There's nothing like typing a one-liner that gets you the data you want from a 10000-line JSON:

```shell
curl 'https://api.github.com/repos/apache/apisix/contributors?per_page=100' | jq \
'sort_by(.contributions) |
reverse |
map({username: .login, contributions}) |
.[0:5]'
```

{{< codapi sandbox="jq" editor="basic" >}}

You can go further and work with your own examples in the [jq Playground](/playgrounds/jq/).
