---
title: "{{ replace .Name "-" " " | title }} Playground"
date: {{ .Date }}
experimental: true
EnableCodapi: true
CodapiURL: 127.0.0.1:1314/v1
ShowCodeCopyButtons: false
cover:
    image: "/images/pl-{{ .Name }}/"
    alt: ""
    relative: false
    hidden: true
---
