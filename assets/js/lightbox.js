// Image viewer for post images. Each content image is a link to its full-size
// file (layouts/shortcodes/figure.html); a plain click opens it here instead
// of in a new tab. Middle-click, Cmd/Ctrl-click and "Open in new tab" still
// follow the link, and without JS the link is all there is.
//
// The viewer is a modal <dialog>, like the "?" list (footer.html), so the
// browser handles Esc, focus trapping and hiding the page from screen
// readers. The images of a post form one set: arrows, buttons and swipes move
// through it.
(function () {
    var SWIPE = 50; // px a finger must travel to count as a swipe
    var DRAG = 5; // px a mouse must travel before a press is a drag, not a click

    var dialog = document.getElementById("lightbox");
    if (!dialog || typeof dialog.showModal !== "function") return;

    var stage = dialog.querySelector(".lightbox-stage");
    var img = dialog.querySelector(".lightbox-img");
    var caption = dialog.querySelector(".lightbox-caption");
    var count = dialog.querySelector(".lightbox-count");
    var status = dialog.querySelector(".lightbox-status");
    var zoomButton = dialog.querySelector(".lightbox-zoom");
    var original = dialog.querySelector(".lightbox-original");
    var prev = dialog.querySelector(".lightbox-prev");
    var next = dialog.querySelector(".lightbox-next");

    var IMAGE_FILE = /\.(jpe?g|png|gif|webp|avif|svg)$/i;

    var links = []; // the set being viewed
    var index = 0;
    var item = null; // what is known about the image on screen
    var zoomed = false;
    var token = 0; // bumped on every change, so a late load can't land on the wrong image

    // A link that shows a picture of the file it points to. Links from an
    // image to some other page (an xkcd strip, a GitHub thread) stay links.
    function viewable(a) {
        if (!a.closest(".post-content figure") || a.hasAttribute("download")) return false;
        var thumb = a.querySelector("img");
        if (!thumb || thumb.classList.contains("in-text")) return false;
        var url;
        try { url = new URL(a.href); } catch (e) { return false; }
        return /^https?:$/.test(url.protocol) && IMAGE_FILE.test(url.pathname);
    }

    document.addEventListener("click", function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a || !viewable(a)) return;
        e.preventDefault();
        var set = Array.prototype.filter.call(
            a.closest(".post-content").querySelectorAll("a[href]"), viewable);
        open(set, set.indexOf(a));
    });

    // Sizes come from the page's own <img>: its width attribute is the
    // largest file in its srcset, and its aspect-ratio style holds the
    // original's dimensions (layouts/partials/responsive-image.html). GIFs,
    // SVGs and remote images have neither until they load.
    function describe(a) {
        var thumb = a.querySelector("img");
        var full = { w: 0, h: 0 };
        var m = /(\d+)\s*\/\s*(\d+)/.exec(thumb.style.aspectRatio || "");
        if (m) { full.w = +m[1]; full.h = +m[2]; }
        else if (thumb.naturalWidth) { full.w = thumb.naturalWidth; full.h = thumb.naturalHeight; }
        return {
            link: a,
            thumb: thumb,
            full: full,
            // A larger file than the srcset's best, fetched only to zoom in.
            original: a.href.split("#")[0],
            srcset: thumb.getAttribute("srcset") || "",
            src: thumb.src
        };
    }

    function open(set, i) {
        links = set;
        show(i);
        dialog.showModal();
        // A swipe or wheel over the viewer must not scroll the page under it.
        document.documentElement.classList.add("lightbox-open");
    }

    function show(i) {
        index = (i + links.length) % links.length;
        item = describe(links[index]);
        zoomed = false;
        var mine = ++token;

        img.alt = item.thumb.alt;
        img.classList.toggle("invert-diagram-colors", item.thumb.classList.contains("invert-diagram-colors"));
        // What the page already shows appears at once; a sharper file
        // replaces it when it has loaded.
        img.removeAttribute("srcset");
        img.src = item.thumb.currentSrc || item.src;
        img.classList.add("is-loading");

        var figcaption = links[index].closest("figure");
        figcaption = figcaption && figcaption.querySelector("figcaption");
        caption.innerHTML = figcaption ? figcaption.innerHTML : "";
        caption.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
        caption.hidden = !figcaption;

        var many = links.length > 1;
        prev.hidden = next.hidden = !many;
        count.textContent = many ? (index + 1) + " / " + links.length : "";
        // Read out on each move; the visible "3 / 8" is hidden from screen
        // readers, which would say "3 slash 8".
        status.textContent = many ? "Image " + (index + 1) + " of " + links.length : "";
        original.href = item.original;

        if (item.full.w) layout();
        else whenLoaded(item.thumb, mine, function () {
            item.full = { w: item.thumb.naturalWidth, h: item.thumb.naturalHeight };
            layout();
        });
        load(item, mine);
    }

    // Calls back once the image has dimensions, unless the viewer has moved on.
    function whenLoaded(el, mine, done) {
        if (el.complete && el.naturalWidth) { done(); return; }
        el.addEventListener("load", function () { if (mine === token) done(); }, { once: true });
        if (el.loading === "lazy") el.loading = "eager";
    }

    // Fetches a file away from the page and swaps it in once decoded, so the
    // image on screen never goes blank while the next one loads.
    function fetchInto(src, srcset, sizes, mine, done) {
        var loader = new Image();
        if (srcset) { loader.sizes = sizes; loader.srcset = srcset; }
        loader.src = src;
        var swap = function () {
            if (mine !== token) return;
            img.src = loader.currentSrc || loader.src;
            img.classList.remove("is-loading");
            if (done) done(loader);
        };
        // A file that fails to load leaves the preview on screen; the
        // "Original" link is still there.
        var failed = function () { if (mine === token) img.classList.remove("is-loading"); };
        (loader.decode ? loader.decode() : Promise.reject()).then(swap, function () {
            if (loader.complete && loader.naturalWidth) swap();
            else if (loader.complete) failed();
            else {
                loader.addEventListener("load", swap, { once: true });
                loader.addEventListener("error", failed, { once: true });
            }
        });
    }

    function load(it, mine) {
        var width = Math.max(1, Math.round(fit(it).w));
        fetchInto(it.src, it.srcset, width + "px", mine, function () {
            // The neighbours, so moving on shows a sharp image at once.
            if (links.length < 2) return;
            [index + 1, index - 1].forEach(function (j) {
                var n = describe(links[(j + links.length) % links.length]);
                var pre = new Image();
                if (n.srcset) { pre.sizes = width + "px"; pre.srcset = n.srcset; }
                pre.src = n.src;
            });
        });
    }

    // The largest size that fits the stage, never past one image pixel per
    // CSS pixel.
    function fit(it) {
        // The stage's box less its padding: the room the image actually has.
        var cs = getComputedStyle(stage);
        var w = (stage.clientWidth || window.innerWidth) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        var h = (stage.clientHeight || window.innerHeight) - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        if (!it.full.w) return { w: 0, h: 0 };
        var s = Math.min(1, w / it.full.w, h / it.full.h);
        return { w: it.full.w * s, h: it.full.h * s };
    }

    // Zoomed in: one image pixel per screen pixel, and at least twice the
    // fitted size, but never past one image pixel per CSS pixel. A tall
    // screenshot ends up as wide as it was taken, and scrolls.
    function zoomSize(it) {
        var f = fit(it);
        var w = Math.min(it.full.w, Math.max(it.full.w / (window.devicePixelRatio || 1), f.w * 2));
        return { w: w, h: w * it.full.h / it.full.w };
    }

    function zoomable() {
        return item && item.full.w > 0 && zoomSize(item).w > fit(item).w * 1.15;
    }

    function layout() {
        var size = zoomed ? zoomSize(item) : fit(item);
        img.style.width = size.w + "px";
        img.style.height = size.h + "px";
        var can = zoomable();
        if (!can) zoomed = false;
        zoomButton.hidden = !can;
        zoomButton.setAttribute("aria-pressed", zoomed ? "true" : "false");
        dialog.classList.toggle("is-zoomable", can);
        dialog.classList.toggle("is-zoomed", zoomed);
    }

    // Zooms keeping the point (x, y) under the pointer, or the middle of the
    // screen from the keyboard.
    function zoom(on, x, y) {
        if (on && !zoomable()) return;
        var r = img.getBoundingClientRect();
        var s = stage.getBoundingClientRect();
        if (x === undefined) { x = s.left + s.width / 2; y = s.top + s.height / 2; }
        var fx = Math.min(1, Math.max(0, (x - r.left) / r.width));
        var fy = Math.min(1, Math.max(0, (y - r.top) / r.height));
        zoomed = on;
        layout();
        r = img.getBoundingClientRect();
        stage.scrollLeft += r.left + fx * r.width - x;
        stage.scrollTop += r.top + fy * r.height - y;
        // So the arrow keys scroll the zoomed image.
        if (on) stage.focus({ preventScroll: true });
        if (on && item.original !== item.src.split("#")[0]) {
            fetchInto(item.original, "", "", token);
        }
    }

    zoomButton.addEventListener("click", function () { zoom(!zoomed); });
    prev.addEventListener("click", function () { show(index - 1); });
    next.addEventListener("click", function () { show(index + 1); });

    // A click on the image zooms; a click on the empty space around it
    // closes, as a click outside the "?" list does.
    var drag = null;
    var dragged = false;
    var pressedOn = null; // a press that starts on the image and ends beside it is not a click outside
    stage.addEventListener("click", function (e) {
        if (dragged) { dragged = false; return; }
        var onImage = e.target === img;
        if (onImage !== (pressedOn === img)) return;
        if (!onImage) dialog.close();
        else if (zoomed || zoomable()) zoom(!zoomed, e.clientX, e.clientY);
    });

    // Zoomed in, the stage scrolls; a mouse drags it like a hand tool.
    stage.addEventListener("pointerdown", function (e) {
        pressedOn = e.target;
        if (!zoomed || e.pointerType !== "mouse" || e.button !== 0) return;
        drag = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
        dragged = false;
    });
    stage.addEventListener("pointermove", function (e) {
        if (!drag) return;
        var dx = e.clientX - drag.x;
        var dy = e.clientY - drag.y;
        if (!dragged && Math.abs(dx) + Math.abs(dy) < DRAG) return;
        if (!dragged) { dragged = true; stage.setPointerCapture(e.pointerId); dialog.classList.add("is-dragging"); }
        stage.scrollLeft = drag.left - dx;
        stage.scrollTop = drag.top - dy;
        e.preventDefault();
    });
    function endDrag() { drag = null; dialog.classList.remove("is-dragging"); }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    // Stops the browser dragging the image out as a file.
    img.addEventListener("dragstart", function (e) { e.preventDefault(); });

    // Touch: swipe sideways for the next image, down to close. Not while
    // zoomed or pinch-zoomed, when a swipe is panning.
    var touch = null;
    stage.addEventListener("touchstart", function (e) {
        var pinched = window.visualViewport && window.visualViewport.scale > 1.01;
        touch = (e.touches.length === 1 && !zoomed && !pinched)
            ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
        if (!touch || e.touches.length) return;
        var dx = e.changedTouches[0].clientX - touch.x;
        var dy = e.changedTouches[0].clientY - touch.y;
        touch = null;
        if (Math.abs(dx) > SWIPE && Math.abs(dx) > 1.5 * Math.abs(dy) && links.length > 1) {
            show(index + (dx < 0 ? 1 : -1));
        } else if (dy > SWIPE * 2 && dy > 1.5 * Math.abs(dx)) {
            dialog.close();
        }
    }, { passive: true });

    dialog.addEventListener("keydown", function (e) {
        if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
        // Zoomed in, the arrows scroll the image instead.
        var moving = !zoomed && links.length > 1;
        switch (e.key) {
            case "ArrowRight": if (!moving) return; show(index + 1); break;
            case "ArrowLeft": if (!moving) return; show(index - 1); break;
            case "Home": if (!moving) return; show(0); break;
            case "End": if (!moving) return; show(links.length - 1); break;
            case "z": case "Z": case "+": case "=": case "-":
                var on = e.key === "-" ? false : (e.key === "+" || e.key === "=") ? true : !zoomed;
                if (on === zoomed) return;
                zoom(on);
                break;
            default: return;
        }
        e.preventDefault();
    });

    window.addEventListener("resize", function () {
        if (dialog.open && item) layout();
    });

    // Focus goes back to the link of the image last shown, which may not be
    // the one first clicked, so the reader carries on from where they are.
    dialog.addEventListener("close", function () {
        document.documentElement.classList.remove("lightbox-open");
        token++;
        var a = links[index];
        img.removeAttribute("src");
        if (!a) return;
        a.focus({ preventScroll: true });
        var r = a.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) a.scrollIntoView({ block: "center" });
    });
})();
