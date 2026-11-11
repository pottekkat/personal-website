---
title: "{{ replace (path.Base (path.Dir .File.Path)) "-" " " | title }}"
date: {{ .Date }}
# ISO 3166-1 alpha-2 code. It picks the flag and the country on the map.
code: ""
# The city on the cover map. Leave lat/lon empty and run
# `node scripts/places/city-map.mjs content/places/<folder>` to look them up.
city: ""
lat:
lon:
# Months I was there, as "YYYY-MM".
visits: []
# Posts show up here when they list this folder in their front matter,
# like `places: ["new-zealand"]`.
summary: "My visits to {{ replace (path.Base (path.Dir .File.Path)) "-" " " | title }}."
---
