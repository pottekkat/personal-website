---
title: "{{ replace (path.Base (path.Dir .File.Path)) "-" " " | title }}"
# When I was there. The page shows the month and year.
date: {{ .Date }}
# Set by the "Draw map" button, or by
# `node scripts/places/city-map.mjs content/places/<folder>`.
map: ""
# Posts show up here when they list this folder in their front matter,
# like `places: ["new-zealand"]`.
summary: "My visits to {{ replace (path.Base (path.Dir .File.Path)) "-" " " | title }}."
---
