---
title: "{{ replace .Name "-" " " | title }} Playground"
layout: "playground-theme"
date: {{ .Date }}
lastmod: {{ .Date }}
experimental: true
EnableCodapi: true
CodapiURL: 127.0.0.1:1314/v1
tags: ["playground", "codapi"]
categories: ["Playground"]
cover:
    image: "/images/{{ .Name }}/"
    alt: ""
    relative: false
    hidden: true
---
