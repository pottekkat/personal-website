// Custom Plausible events. Loaded by layouts/partials/analytics.html, only
// where Plausible itself runs, so window.plausible always exists here.
// Every event name and property below must also be added as a goal or custom
// property in Plausible's site settings to show up in the dashboard; the list
// is in docs/analytics.md. Never send anything a visitor typed.
(function () {
  "use strict";

  function track(name, props) {
    window.plausible(name, props ? { props: props } : undefined);
  }

  // Links: tag them with Plausible's classes instead of listening for clicks,
  // so the script itself sends the event and waits for it before following
  // the link. A tagged link sends only this event, not Outbound Link: Click.
  function tag(el, name, props) {
    var classes = ["plausible-event-name=" + name];
    Object.keys(props).forEach(function (key) {
      classes.push("plausible-event-" + key + "=" + props[key]);
    });
    classes.forEach(function (c) {
      el.classList.add(c.replace(/ /g, "+"));
    });
  }

  function tagLinks() {
    // "share <title> on <network>", see partials/share_icons.html.
    document.querySelectorAll(".share-buttons a[aria-label]").forEach(function (a) {
      var network = a.getAttribute("aria-label").split(" on ").pop();
      tag(a, "Share", { network: network });
    });
    document.querySelectorAll('a.rss-icon-link, a[href$="/index.xml"]').forEach(function (a) {
      tag(a, "RSS", { feed: a.pathname });
    });
  }

  // Search boxes (assets/js/fastsearch.js): one event per page, once typing
  // settles, saying only whether anything matched. The count comes from the
  // "searchresults" event, so a search index that is still downloading when
  // typing stops delays the event instead of recording "none".
  function watchSearch() {
    var input = document.getElementById("searchInput");
    if (!input) return;
    var timer;
    var sent = false;
    var settled = false;
    var count = null;
    function maybeSend() {
      if (sent || !settled || count === null || input.value.trim().length < 2) return;
      sent = true;
      track("Search", { results: count ? "found" : "none" });
    }
    input.addEventListener("input", function () {
      clearTimeout(timer);
      settled = false;
      count = null;
      timer = setTimeout(function () {
        settled = true;
        maybeSend();
      }, 1500);
    });
    input.addEventListener("searchresults", function (e) {
      count = e.detail.count;
      maybeSend();
    });
  }

  document.addEventListener("click", function (e) {
    var el = e.target instanceof Element ? e.target : null;
    if (!el) return;
    var hit;

    if ((hit = el.closest(".copy-code"))) {
      var block = hit.parentNode;
      var code = block && block.querySelector("code[data-lang]");
      track("Copy Code", { language: code ? code.getAttribute("data-lang") : "none" });
    } else if (el.closest("#theme-toggle")) {
      // The toggle's own handler (partials/footer.html) has already run.
      track("Theme Toggle", { theme: document.body.classList.contains("dark") ? "dark" : "light" });
    } else if (el.closest("#view-toggle")) {
      track("Books View", { view: document.body.classList.contains("list-active") ? "list" : "grid" });
    } else if (el.closest("#read-filter")) {
      track("Books Filter", { filter: document.body.classList.contains("read-only-active") ? "on" : "off" });
    } else if (el.closest("#searchResults a")) {
      track("Search Result Click");
    }
  });

  // A search result opened in a new tab with the middle button fires
  // auxclick, not click.
  document.addEventListener("auxclick", function (e) {
    if (e.button === 1 && e.target instanceof Element && e.target.closest("#searchResults a")) {
      track("Search Result Click");
    }
  });

  // Tabs shortcode (partials/footer.html): mouse and keyboard.
  document.addEventListener("tabchosen", function (e) {
    track("Tab Switch", { tab: e.detail.tab });
  });

  // Runnable snippets (assets/js/codapi). "result" and "error" do not bubble,
  // so listen in the capture phase.
  ["result", "error"].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var t = e.target;
      if (!t || t.tagName !== "CODAPI-SNIPPET") return;
      track("Code Run", {
        result: type === "result" && e.detail && e.detail.ok ? "ok" : "failed",
        sandbox: t.getAttribute("sandbox") || "none",
      });
    }, true);
  });

  function ready() {
    tagLinks();
    watchSearch();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
