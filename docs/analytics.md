# Analytics

The site uses [Plausible](https://plausible.io): no cookies, no personal data,
no consent banner. `content/stats.md` is the public statement of this.

## How it is wired

| Piece | File |
|---|---|
| Switch, host and URLs | `config.yml` → `params.plausible` (`enable`, `host`, `script`, `endpoint`) |
| Snippet in `<head>` | `layouts/partials/analytics.html` |
| Custom events | `assets/js/analytics.js` |
| Newsletter and webmention results | `layouts/partials/subscription-form.html`, `layouts/partials/webmentions.html` |
| Hooks the events use | `searchresults` in `assets/js/fastsearch.js`, `tabchosen` in `layouts/partials/footer.html` |
| Proxy rules | `netlify.toml` (`/misc/js/pa.js`, `/misc/api/event`) |

The snippet is emitted only in production builds (`hugo.IsProduction`) and runs
only when `location.hostname` is `params.plausible.host` (`navendu.me`). The
host is not taken from `baseURL` because deploy previews set their own. Deploy previews, branch deploys,
the gh-pages mirror, `hugo server` and the perf harness load nothing.

The script and its events go through `/misc/` on this site, so blockers that
block `plausible.io` still count the visit. The site's domain is baked into the
script (`pa-<id>.js`). To change scripts, change the rewrite in `netlify.toml`;
the ID is on Plausible → Site settings → Site installation.

## What is recorded

Every event carries two custom properties:

- `section`: the Hugo section (`posts`, `books`, `dailies`, …; taxonomy
  pages give `categories` or `tags`), or the page kind outside sections
  (`home`, `page` for top-level pages like /stats/, `404`)
- `theme`: `dark` or `light`, as the visitor sees the page when the event
  is sent (`engagement` repeats the value from its pageview)

Sent by the Plausible script:

| Event | Properties | When |
|---|---|---|
| `pageview` | | every page load |
| `engagement` | | leaving the page; gives scroll depth and time on page |
| `Outbound Link: Click` | `url` | link to another site |
| `File Download` | `url` | link to a pdf, zip, docx and similar |
| `Form: Submission` | | any valid form submit (newsletter, webmention) |
| `404` | | missing page (sent from the snippet) |

Sent by this site:

| Event | Properties | When |
|---|---|---|
| `Newsletter Signup` | `result`: `success`, `already subscribed`, `error`, `timeout`, `network error` | Mailchimp answers |
| `Webmention` | `result`: `success`, `error` | webmention.io answers |
| `Search` | `results`: `found`, `none` | once per page, 1.5s after typing stops (2+ characters) |
| `Search Result Click` | | a search result is clicked (also middle-click) |
| `Copy Code` | `language` | copy button on a code block |
| `Code Run` | `result`: `ok`, `failed`; `sandbox` | runnable snippet (codapi) finishes |
| `Tab Switch` | `tab` (its label) | tabs shortcode, by mouse or keyboard |
| `Theme Toggle` | `theme` (the new one) | theme button |
| `Books View` | `view`: `list`, `grid` | /books view toggle |
| `Books Filter` | `filter`: `on`, `off` | /books "read only" filter |
| `Share` | `network`, `url` | share buttons under a post |
| `RSS` | `feed`, `url` | link to an `index.xml` feed |

Never sent: search text, email addresses, Mailchimp messages, webmention URLs
(including the "Check status" link, dropped by `transformRequest` in the
snippet), or anything else a visitor typed. Keep it that way when adding
events. Page URLs are sent without their fragment or any query parameter
other than `utm_*`, `ref` and `source`, and referrers without their query
(`transformRequest` in the snippet).

## Dashboard setup

An event shows in the dashboard only once it is a goal, and a property only
once it is listed under custom properties (Site settings → Goals, and Site
settings → Custom properties). When adding an event here, add it there too.

- Goals: every event name above except `pageview` and `engagement`.
- Custom properties: `section`, `theme`, `result`, `results`, `language`,
  `sandbox`, `tab`, `view`, `filter`, `network`, `feed`, `url`.
- Shields → Hostnames: `navendu.me` only.

## Keeping your own visits out

In each browser you use, open any navendu.me page and run this in the console:

```js
localStorage.plausible_ignore = "true"
```

The script then logs `Ignoring Event: localStorage flag` instead of sending.
Clearing site data removes the flag. Shields → IP addresses blocks a home IP
as a backup.

## Testing

Production build, then load it as `https://navendu.me` in a headless browser
with requests to `/misc/js/pa.js` answered from a downloaded copy of the
script and `/misc/api/event` captured instead of sent. Set
`window.__plausible = true` before the page loads, or the script ignores the
automated browser. Assert each event's `n` (name) and `p` (properties).
