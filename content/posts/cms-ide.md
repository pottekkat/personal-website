---
title: There's a CMS in My IDE!
slug: cms-ide
date: 2024-11-11T23:01:22+05:30
draft: false
toc:
  show: true
  open: true
ShowRelatedContent: false
description: Why I started using Front Matter CMS to work with my Hugo-based static website and how you can do it, too.
summary: Front Matter is a CMS that runs as a Visual Studio Code extension. It's feature-rich and highly customizable, making it the perfect tool to manage my poorly organized blog.
tags:
  - blogs
  - setup
categories:
  - Writing/Blogging
cover:
  image: /images/cms-ide/toy-story-banner.jpg
  alt: Woody and Buzz from Toy Story.
  caption: And there's a snake in my boots! Seriously, how good was Toy Story?
  relative: true
fmContentType: Post (default)
---

It's been four years since I moved my blog to this Hugo-based static website. Until now, [my workflow for writing new posts](/posts/my-blog-setup-and-writing-process/) involved a lot of manual work:

1. Creating Markdown files in different directories.
2. Filling in the YAML front matter.
3. Creating separate static image folders.
4. Choosing categories and tags from existing posts.
5. Publishing through a pull request-based workflow.

Typically, all these are handled by a CMS. However, the closest thing to a CMS I had was a [CLI I wrote](https://github.com/pottekkat/personal-website/blob/hugo/cmd/main.go) in Go and Hugo's archetypes feature, which worked as well as possible.

This imperfect and borderline tedious workflow added a massive hurdle to an already shabby writing plan. This meant a lot less posts and a lot more burden.

This problem wasn't really new. I have tried to solve it using different CMS solutions that claim to work well with Hugo websites for the past four years. Every one of them failed to wrangle the mess I call my blog.

It reached a point where I gave up trying to use CMS solutions and instead started adding more glue features to my CLI to fix the shortcomings.

All this was until I found [Front Matter CMS](https://frontmatter.codes/) a few weeks ago.

_Front Matter_ lives [inside Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter) and is a fully-featured, highly customizable CMS. I had tried it years ago when it was first released and couldn't get it to work. But now, with its out-of-the-box customization options, it can be tailored to my exact use cases.

In this post, I will walk through my Front Matter setup and show how you can easily manage content on your websites in Visual Studio Code.

## What's Front Matter?

Front Matter is a Visual Studio Code extension that works as a CMS for static websites. It can work with any static site generator, including Hugo, Jekyll, Next.js, Docusaurus, and Gatsby.

Front Matter can be installed directly from [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=eliostruyf.vscode-front-matter). Once the extension is installed and reloaded, you will be greeted by a welcome screen that will take you through the initial setup.

The initial setup entirely depends on how you have structured your website's content. Even with a relatively large website, my initial setup was quite effortless.

> **Tip**: You can change your Front Matter setup _after_ the initial setup. i.e., the initial setup is not permanent.

Once this is done, you can open the _Front Matter Dashboard_.

{{< figure src="/images/cms-ide/dashboard.png#center" title="Front Matter Dashboard" caption="I like using this dashboard as a homepage where I can easily view and add posts." link="/images/cms-ide/dashboard.png" target="_blank" class="align-center" >}}

The dashboard is neat and offers everything you need to create content in a consolidated view. It's also customizable through intuitive extension points. You can check the [official documentation](https://frontmatter.codes/docs/dashboard#overview) to learn more about using and configuring the dashboard. I will instead focus more on my specific setup in this post.

Another useful feature of Front Matter is the _Editor Panel_, which lets you easily manage the actual front matter in your files.

{{< figure src="/images/cms-ide/sidebar.png#center" title="Front Matter Editor Panel" caption="The panel lets you manage front matter easily. Fields are loaded and populated through a predefined configuration." link="/images/cms-ide/sidebar.png" target="_blank" class="align-center" >}}

You can configure different panels for different types of content, and Front Matter will automatically change them. I will defer to the [documentation](https://frontmatter.codes/docs/panel#overview) again to explain the specifics of using the panel and focus on my custom configurations in the following sections.

All Front Matter configurations are stored in the `frontmatter.json` file and the `.frontmatter` folder. This makes modifying, version controlling, and sharing your configuration easy. See the [documentation](https://frontmatter.codes/docs/settings/overview) for all available configurations.

## Specifying Content Types

My blog houses different types of content:

1. **Posts**: Normal posts like this one. Stored in the `/content/posts/` folder.
2. **Dailies**: For my daily logs. Stored in the `/content/dailies/` folder.
3. **Newsletters**: The web page versions of my newsletter issues. Stored in, you guessed it, the `/content/newsletters/` folder.

Each content type has different YAML front matter configurations, i.e., different fields in the front matter (NOT Front Matter CMS). For example, the front matter for this post looks like this:

```yaml {title="/content/posts/cms-ide.md"}
title: There's a CMS in My IDE!
slug: cms-ide
date: 2024-11-09T12:26:23+05:30
draft: true
toc:
  show: true
  open: true
ShowRelatedContent: false
description: Why I started using Front Matter CMS to work with my Hugo-based static website and how you can do it, too.
summary: Front Matter is a CMS that runs as a Visual Studio Code extension. It's feature-rich and highly customizable, making it the perfect tool to manage my poorly organized blog.
tags:
  - blogs
  - setup
categories:
  - Writing/Blogging
cover:
  image: /images/cms-ide/toy-story-banner.jpg
  alt: Woody and Buzz from Toy Story.
  caption: And there's a snake in my boots! How good was Toy Story?
  relative: true
fmContentType: Post (default)
```

While the front matter for a daily log is more like this:

```yaml {title="/content/dailies/3-11-24-redesigning-the-blog.md"}
title: "#291 Redesigning the Blog"
date: 2024-11-03T18:51:12+05:30
draft: false
summary: A week spent well. Sleep-deprived.
fmContentType: Daily
```

Front Matter CMS can be [easily configured to manage](https://frontmatter.codes/docs/content-creation/content-folders) these different types. I can start by specifying the location of the daily logs folder in `frontmatter.content.pageFolders`:

```json {title="frontmatter.json", hl_lines=[5], linenos="inline", linenostart=239}
{
  "title": "Dailies",
  "path": "[[workspace]]/content/dailies",
  "previewPath": "dailies",
  "contentTypes": ["Daily"]
}
```

Here, I specify the `contentTypes` for files in this folder as `Daily`. `Daily` [is defined in](https://frontmatter.codes/docs/content-creation/content-types) `frontmatter.taxonomy.contentTypes`:

```json {title="frontmatter.json", linenos="inline", hl_lines=[4, "11-16", 22], linenostart=147}
{
  "name": "Daily",
  "pageBundle": false,
  "filePrefix": "{{date|d-M-yy}}",
  "fields": [
    {
      "title": "Title",
      "name": "title",
      "type": "string",
      "single": true,
      "actions": [
        {
          "title": "Add log number",
          "script": "./scripts/frontmatter/daily-logs-title.js"
        }
      ]
    },
    {
      "title": "Publishing date",
      "name": "date",
      "type": "datetime",
      "dateFormat": "yyyy-MM-dd'T'HH:mm:ssXXX",
      "default": "{{now}}",
      "isPublishDate": true
    },
    {
      "title": "Draft?",
      "name": "draft",
      "type": "draft"
    },
    {
      "title": "Summary",
      "name": "summary",
      "type": "string"
    }
  ]
}
```

Now, every time I open a daily log, Front Matter loads the appropriate editor panel. The only non-trivial parts in this configuration might be:

`150`: Prefixes file names with the date in the specified format.

`157` to `162`: Adds a custom action, `Add log number`, to prefix the title with the log number. More on the script in the [next section](#extending-with-scripts).

`168`: Overrides the default date format to ensure consistency with old posts.

My complete `frontmatter.json` [configuration](https://github.com/pottekkat/personal-website/blob/hugo/frontmatter.json) is available on GitHub.

## Extending with Scripts

In the above section, I mentioned a [custom action](https://frontmatter.codes/docs/custom-actions), `Add log number`, which prefixes the title with the log number. The script is a few lines of JavaScript:

```js {title="/scripts/frontmatter/daily-logs-title.js", linenos="inline"}
import { FieldAction } from "@frontmatter/extensibility";
import * as fs from "fs";

(async () => {
  const { frontMatter } = FieldAction.getArguments();

  if (!frontMatter.title) {
    FieldAction.done();
    return;
  }

  // subtract 1 to offset the index file
  const logNumber = fs.readdirSync("./content/dailies").length - 1;

  FieldAction.update("#" + logNumber + " " + frontMatter.title);
})();
```

This script defines a _Field Action_, i.e., a script that runs on a particular field; in this case, it is the `title` field. The code is quite trivial:

`1`: Create custom scripts using the `@frontmatter/extensibility` library.

`15`: Update the title with the `#logNumber` prefix.

You will find a new field action button next to the `title` field:

{{< figure src="/images/cms-ide/field-action.png#center" title="\"Add log number\" field action" caption="Since I have GitHub Copilot enabled, I also have a Copilot field action." link="/images/cms-ide/field-action.png" target="_blank" class="align-center" >}}

I also have another script that creates folders to store images. It's specified in my `frontmatter.json` file:

```json {title="frontmatter.json", linenos="inline", linenostart=257}
{
  "frontMatter.custom.scripts": [
    {
      "id": "create-image-folder",
      "title": "Create image folder",
      "script": "./scripts/frontmatter/create-image-folder.js"
    }
  ]
}
```

The script takes the current file path, strips it to get the file name, and uses it to create an image folder:

```js {title="/scripts/frontmatter/create-image-folder.js"}
import { ContentScript } from "@frontmatter/extensibility";
import * as fs from "fs";

const { command, scriptPath, workspacePath, filePath, frontMatter, answers } =
  ContentScript.getArguments();

(async () => {
  const folderName = filePath.split("/").pop().split(".").shift();

  const folderPath = `./static/images/${folderName}`;
  fs.mkdirSync(folderPath);

  console.log(`Image folder created: ${folderPath}`);
})();
```

As is evident from the above code, I suck at writing JavaScript.

This script adds a _Custom Action_ to the Editor Panel:

{{< figure src="/images/cms-ide/custom-action.png#center" title="\"Create image folder\" custom action" caption="You could also automate this script to run after creating posts but a button gives me control." link="/images/cms-ide/custom-action.png" target="_blank" class="align-center" >}}

Finally, I have a _[UI Extension](https://frontmatter.codes/docs/ui-extensibility)_ that adds a placeholder image when the preview image is not provided. This isn't a functional requirement, but my dashboard looks much better without empty spaces.

UI extensions are also specified in the `frontmatter.json` file, similar to other scripts/extensions:

```json {title="frontmatter.json", linenos="inline", linenostart=264}
{
  "frontMatter.extensibility.scripts": ["./.frontmatter/ui/external.js"]
}
```

Then, the UI extension is defined as shown below:

```js {title="/.frontmatter/ui/external.js"}
import {
  enableDevelopmentMode,
  registerCardImage,
  registerCardFooter,
  registerPanelView,
  registerCustomField,
} from "https://cdn.jsdelivr.net/npm/@frontmatter/extensibility/+esm";

// enableDevelopmentMode();

registerCardImage(async (filePath, metadata) => {
  const image = metadata.fmPreviewImage
    ? metadata.fmPreviewImage
    : `${metadata.fmWebviewUrl}/static/images/preview.png`;
  return `<img src="${image}" alt="${metadata.title}" style="width: 100%; height: auto; object-fit: cover;" />`;
});
```

Looking at these scripts now, it's obvious that there's a lot of room for improvement. But since they just execute locally, there isn't any additional overhead, which is to say _I ain't fixing them anytime soon_.

## Writing using Snippets

The most powerful feature in Front Matter, in my opinion, is snippets. It lets you predefine code or code templates that can easily inserted into your posts. This isn't a novel idea; if you are familiar with code snippets in Visual Studio Code, it's similar but much easier to use.

I migrated most of my existing code snippets to Front Matter, which made my writing much faster. Let me show some examples.

I have created a `Quote` snippet that lets me convert the selected text to a blockquote shortcode with a title, author, and link. Instead of manually typing the shortcode, I can insert the snippet and add the values through the GUI, as shown below:

{{< figure src="/images/cms-ide/quote-snippet.gif#center" title="Quote snippet in action" caption="I can easily select the text, apply the quote snippet, add the details, and it's converted to a shortcode. Less boilerplates for me!" link="/images/cms-ide/quote-snippet.gif" target="_blank" class="align-center" >}}

Snippets are configured inside `frontMatter.content.snippets` in your `frontmatter.json` file:

```json
{
  "frontMatter.content.snippets": {
    "Quote": {
      "description": "Quote with the author, link, and title.",
      "body": [
        "{{</* blockquote author=\"[[author]]\" link=\"[[&link]]\" title=\"[[title]]\" */>}}",
        "[[selection]]",
        "{{</* /blockquote */>}}"
      ],
      "fields": [
        {
          "name": "author",
          "title": "Author",
          "type": "string",
          "single": true
        },
        {
          "name": "title",
          "title": "Title",
          "type": "string",
          "single": true
        },
        {
          "name": "link",
          "title": "Link",
          "type": "string",
          "single": true
        },
        {
          "name": "selection",
          "title": "Quote",
          "type": "string",
          "default": "FM_SELECTED_TEXT"
        }
      ]
    }
  }
}
```

The placeholders (`[[author]]`, `[[&link]]`) in the snippet are replaced by the value added into the corresponding field in the GUI.

I have also created a `Figure` media snippet to easily add images with a title, caption, and URL:

```json
{
  "frontMatter.content.snippets": {
    "Figure": {
      "description": "Figure with title, caption, and link.",
      "body": "{{</* figure src=\"[[&mediaUrl]]#center\" title=\"[[title]]\" caption=\"[[caption]]\" link=\"[[&mediaUrl]]\" target=\"_blank\" class=\"align-center\" */>}}",
      "isMediaSnippet": true
    }
  }
}
```

Now, I can add an image directly through the UI:

{{< figure src="/images/cms-ide/figure-snippet.gif#center" title="Adding an image using the `Figure` snippet" caption="Note that I had already configured the title and the caption for the image in its metadata." link="/images/cms-ide/figure-snippet.gif" target="_blank" class="align-center" >}}

I have similarly added snippets for other shortcodes and commonly used templates. This lets me focus on the content rather than the structure.

## A Tailored CMS

To wrap up, Front Matter has been great. It fits all my workflows without any annoying gaps in between to prevent me from fully committing.

My current setup took a couple of days of experimentation. There are even more customizations I can think of to squeeze the last ounce of productivity. But now, the marginal costs of adding more customizations outweigh the marginal benefits—sharpening my knife is futile if I don't cut anything.

So, in the foreseeable future, I will stick with my current setup. I will use it to write more posts faster and easier, focusing on content rather than structure.
