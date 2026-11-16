// Vim-style keyboard shortcuts, in the GitHub/Gmail pattern: single
// character keys, "g" sequences, and "?" for the list.
//
// Accessibility (WCAG 2.1.4 Character Key Shortcuts): the keys can be turned
// off from the "?" dialog. "?" itself stays on, as the way back in; all it
// does is open that dialog, which Esc closes.
// They never fire while typing, while an IME is composing, or with Ctrl, Alt
// or Cmd held, so browser and screen reader shortcuts and the site's
// accesskeys keep working.
(function () {
    var STORE_KEY = "shortcuts";
    var SEQUENCE_TIMEOUT = 1500; // ms, as in GitHub's @github/hotkey
    var SCROLL_STEP = 60; // px per j/k press on a page with no cards
    var TOP_GAP = 24; // px above a tall card's title; the theme's --gap

    var dialog = document.getElementById("shortcuts");
    var toggle = document.getElementById("shortcuts-enabled");
    if (!dialog || !toggle || typeof dialog.showModal !== "function") return;

    // The first link of each card on list pages: posts, archives, TILs,
    // notes and books. Moving real focus lets screen readers announce the
    // card and Enter open it.
    var ITEMS = [
        ".post-entry > .entry-link",
        ".archive-entry > .entry-link",
        ".place-tile > .entry-link",
        ".til-entry-header > a",
        ".note-timestamp > a",
        "a.book-card",
        ".book-row a"
    ].join(", ");

    var GO_TO = { h: "/", p: "/posts/", b: "/books/", a: "/archives/" };

    // Elements that say which key reaches them, for assistive technology.
    // Set only while the keys are on, since a disabled shortcut must not be
    // announced.
    var HINTS = [
        ["#searchInput", "/"],
        [".paginav a.next, .pagination a.next", "n"],
        [".paginav a.prev, .pagination a.prev", "p"]
    ];

    // Overlays that own the keyboard while open: the phone menu is a popover,
    // or #menu.active in browsers without popovers (header.html), where the
    // :popover-open selector would throw.
    var OVERLAYS = "dialog[open], #menu.active";
    try { document.querySelector(":popover-open"); OVERLAYS += ", :popover-open"; } catch (e) { }

    // The switch's state lives here, so "off" works even when storage is
    // blocked; storage only carries it to the next page.
    var storageFailed = false;
    var on = read();

    // Once storage has failed, a later read must not undo a switch made on
    // this page (e.g. on a back/forward cache restore).
    function read() {
        if (storageFailed) return on;
        try {
            return localStorage.getItem(STORE_KEY) !== "off";
        } catch (e) {
            storageFailed = true;
            return on !== false;
        }
    }

    function render() {
        toggle.textContent = on ? "Disable" : "Enable";
        dialog.classList.toggle("is-off", !on);
        HINTS.forEach(function (h) {
            document.querySelectorAll(h[0]).forEach(function (el) {
                if (on) el.setAttribute("aria-keyshortcuts", h[1]);
                else el.removeAttribute("aria-keyshortcuts");
            });
        });
    }

    render();
    toggle.addEventListener("click", function () {
        on = !on;
        cancel();
        try {
            if (on) localStorage.removeItem(STORE_KEY);
            else localStorage.setItem(STORE_KEY, "off");
        } catch (e) { storageFailed = true; }
        render();
    });
    // Another tab switched the keys on or off.
    window.addEventListener("storage", function (e) {
        if (e.key === STORE_KEY || e.key === null) { cancel(); on = read(); render(); }
    });

    // A click outside the list closes it, like the phone menu. closedby="any"
    // does this natively; this covers browsers without it.
    if (!("closedBy" in dialog)) {
        dialog.addEventListener("click", function (e) {
            if (e.target !== dialog) return;
            var r = dialog.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
        });
    }

    // Text entry gets every key. Buttons, checkboxes and the like don't take
    // letters, so the shortcuts still work from them (as in @github/hotkey).
    function typing(el) {
        if (!el || !el.tagName) return false;
        if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
        return el.tagName === "INPUT" &&
            !/^(button|submit|reset|checkbox|radio|file|image|range|color)$/.test(el.type);
    }

    // The whole card, where the focus target is only its title or timestamp.
    function card(a) {
        return a.closest("article, .archive-entry, .book-card, .book-row") || a;
    }

    function onScreen(a) {
        var r = card(a).getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
    }

    function step(dir) {
        var items = Array.prototype.filter.call(document.querySelectorAll(ITEMS), function (a) {
            return a.getClientRects().length > 0; // skips cards hidden by a filter
        });
        if (!items.length) {
            window.scrollBy(0, dir * SCROLL_STEP);
            return;
        }
        var i = items.indexOf(document.activeElement);
        var next;
        // Continue from the focused card only while it is on screen; after
        // scrolling away, start again from what the reader is looking at.
        if (i !== -1 && onScreen(items[i])) {
            next = items[i + dir];
        } else {
            var shown = items.filter(onScreen);
            if (shown.length) {
                next = dir > 0 ? shown[0] : shown[shown.length - 1];
            } else {
                // Between cards, e.g. in the header or footer.
                var top = function (a) { return card(a).getBoundingClientRect().top; };
                next = dir > 0
                    ? items.filter(function (a) { return top(a) >= window.innerHeight; })[0]
                    : items.filter(function (a) { return top(a) < 0; }).pop();
            }
        }
        if (!next) return;
        next.focus({ preventScroll: true });
        // Scroll only when the card isn't fully on screen: centre it, or,
        // when it is taller than the window, bring its title near the top so
        // a long TIL opens at its start.
        // A book card is all link, cover first; its title is what must show.
        var title = next.querySelector(".book-title");
        var r = card(next).getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) {
            if (r.height > window.innerHeight) {
                window.scrollBy(0, (title || card(next)).getBoundingClientRect().top - TOP_GAP);
            } else {
                card(next).scrollIntoView({ block: "center", inline: "nearest" });
            }
        }
        // The focused link itself must show: a tall note's timestamp sits
        // at its foot, and the books table can be scrolled sideways.
        (title || next).scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    function follow(selector) {
        var link = document.querySelector(selector);
        if (link) link.click();
    }

    var pending = false;
    var timer;

    function cancel() {
        pending = false;
        clearTimeout(timer);
    }

    // Single keys; returns false for a key that isn't a shortcut.
    function single(key) {
        switch (key) {
            case "j": step(1); return true;
            case "k": step(-1); return true;
            case "G": window.scrollTo(0, document.documentElement.scrollHeight); return true;
            case "n": follow(".paginav a.next, .pagination a.next"); return true;
            case "p": follow(".paginav a.prev, .pagination a.prev"); return true;
            case "?": dialog.showModal(); return true;
            case "/": {
                // Only where a search box exists; elsewhere "/" stays the
                // browser's own (Firefox quick find).
                var search = document.getElementById("searchInput");
                if (!search) return false;
                search.focus();
                return true;
            }
            case "t": {
                // The header button's own handler saves the choice.
                var theme = document.getElementById("theme-toggle");
                if (!theme) return false;
                theme.click();
                return true;
            }
            case "g":
                pending = true;
                timer = setTimeout(cancel, SEQUENCE_TIMEOUT);
                return true;
        }
        return false;
    }

    // The key after "g".
    function second(key) {
        if (key === "g") { window.scrollTo(0, 0); return true; }
        if (!GO_TO[key]) return false;
        location.href = GO_TO[key];
        return true;
    }

    // Anything else the reader does ends a half-typed "g" sequence.
    document.addEventListener("pointerdown", cancel, true);
    document.addEventListener("focusin", cancel, true);
    window.addEventListener("blur", cancel);
    window.addEventListener("pagehide", cancel);
    // Back/forward cache restores the page as it was left.
    window.addEventListener("pageshow", function (e) {
        if (!e.persisted) return;
        cancel();
        on = read();
        render();
    });

    document.addEventListener("keydown", function (e) {
        var key = e.key;
        // A lone Shift is how "?" and "G" start; it must not end a "g" sequence.
        if (key === "Shift") return;

        // AltGr (Ctrl+Alt on Windows) is how some layouts type "/" and "?".
        var altGraph = (key === "/" || key === "?") && e.getModifierState &&
            e.getModifierState("AltGraph");
        var modified = e.metaKey || ((e.ctrlKey || e.altKey) && !altGraph);

        if ((!on && key !== "?") || e.defaultPrevented || e.isComposing || e.keyCode === 229 ||
            modified || (e.composedPath ? e.composedPath() : [e.target]).some(typing) ||
            document.querySelector(OVERLAYS) ||
            // Search results have their own arrow-key navigation.
            (e.target.closest && e.target.closest("#searchResults"))) {
            cancel();
            return;
        }

        if (pending) {
            cancel();
            if (e.repeat) return;
            if (second(key)) { e.preventDefault(); return; }
            // Not a sequence: treat it as a key of its own.
        } else if (e.repeat && key !== "j" && key !== "k") {
            // Holding j or k keeps scrolling, as in Vim; other keys act once.
            return;
        }

        if (single(key)) e.preventDefault();
    });
})();
