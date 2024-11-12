---
title: Exclude Files and Folders from Front Matter CMS
date: 2024-11-12T14:20:51+05:30
description: Setting to disable specific files and folders from content folders.
fmContentType: TILs
---

To prevent Front Matter CMS from including specific files and folders, you can provide the paths to be excluded in `excludePaths` under `frontMatter.content.pageFolders`:

```json
{
  "frontMatter.content.pageFolders": [
    {
      "title": "Posts",
      "path": "[[workspace]]/content/posts",
      "previewPath": "posts",
      "contentTypes": ["Post (default)"],
      "excludePaths": [
        "_*.*" // Exclude all files starting with an underscore
      ]
    }
  ]
}
```

I use this to exclude `_index.md` files from Front Matter.
