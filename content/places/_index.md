---
title: "Places"
description: "Places I have been to."
summary: "places"
# My home country: drawn hatched on the map, with no page of its own.
home:
  code: "IN"
  name: "India"
outputs: ["HTML"]
# Each place is a term of the `places` taxonomy (config.yml). A post, daily,
# newsletter or book review lists the places it was written about in its own
# `places` front matter, and shows up on that place's page.
cascade:
  outputs: ["HTML"]
  build:
    # map.svg is inlined into the page, so it is not published on its own.
    publishResources: false
---
