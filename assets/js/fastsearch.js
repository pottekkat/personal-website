import * as params from "@params";

let index; // the search index, built once the post text has loaded
let pages; // the posts the index was built from, by id
let resList = document.getElementById("searchResults");
let sInput = document.getElementById("searchInput");
let first,
  last,
  current_elem = null;
let resultsAvailable = false;

// Load our search index. It is ~1.3 MB of post text, which is far too much to
// pull on every page that merely has a search box. Nobody can search without
// first focusing the input, so we fetch it then (and on hover, which usually
// comes a moment earlier). Anything typed before it lands is re-run once it is
// ready, so the behaviour is the same, just without the up-front download.
let indexRequested = false;
function loadSearchIndex() {
  if (indexRequested) return;
  indexRequested = true;
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch (e) {
          // Clear the guard so the next keystroke or hover can retry.
          indexRequested = false;
          console.error(e);
          return;
        }
        let searchBox = document.querySelector("#searchInput");
        let showOnly = searchBox.dataset.showOnly;
        let omit = searchBox.dataset.omit;

        let omitValues = omit ? omit.split(", ") : [];

        // Filter data based on "showOnly" and "omit"
        if (showOnly) {
          data = data.filter(function (item) {
            return item.section.indexOf(showOnly) !== -1;
          });
        } else if (omitValues.length > 0) {
          data = data.filter(function (item) {
            return omitValues.every(function (value) {
              return item.section.indexOf(value) === -1;
            });
          });
        }
        if (data) {
          // Each word is matched on its own, so word order does not matter.
          // A word longer than four letters forgives a typo or two
          // ("kubernets"), and the last word matches as a prefix while it is
          // still being typed. A match in the title counts most.
          let docs = data.map(function (item, i) {
            return {
              id: i,
              title: item.title,
              categories: (item.categories || []).join(" "),
              summary: item.summary,
              content: item.content,
            };
          });
          index = new MiniSearch({
            fields: ["title", "categories", "summary", "content"],
            searchOptions: {
              boost: { title: 5, categories: 2, summary: 1.5 },
              // Typo matching costs memory that grows with the square of
              // the word's length, so a pasted run of letters gets none.
              fuzzy: function (term) {
                return term.length > 4 && term.length <= 30 ? 0.2 : 0;
              },
              // Only the word still being typed is a prefix; an earlier
              // "go" should not also match "google" and "good".
              prefix: function (term, i, terms) {
                return i === terms.length - 1;
              },
              combineWith: "AND",
            },
          });
          index.addAll(docs);
          pages = data;
          // Someone may have typed while the index was still downloading.
          if (sInput.value.trim()) runSearch();
        }
      } else {
        indexRequested = false;
        console.log(xhr.responseText);
      }
    }
  };
  // A dropped connection never reaches readyState 4 with a status, so the guard
  // has to be cleared here too, or search stays permanently broken for the tab.
  xhr.onerror = function () {
    indexRequested = false;
  };
  xhr.onabort = xhr.onerror;
  // A request that stalls without failing would otherwise leave the guard set
  // for the life of the page.
  xhr.timeout = 30000;
  xhr.ontimeout = xhr.onerror;
  xhr.open("GET", "/index.json");
  xhr.send();
}

// Deliberately not `focus`: several list pages autofocus the box on load, which
// would fetch the index on every visit again. The first keystroke or the mouse
// arriving over the box are the real signals that someone means to search, and
// both land well before a query is complete.
sInput.addEventListener("keydown", loadSearchIndex);
sInput.addEventListener("pointerenter", loadSearchIndex);
sInput.addEventListener("pointerdown", loadSearchIndex);
// Autofill, speech input and some IME flows change the value without ever
// producing a key event.
sInput.addEventListener("input", loadSearchIndex);
// A query restored by the browser on back/forward navigation must not wait.
if (sInput.value) loadSearchIndex();

function activeToggle(ae) {
  document.querySelectorAll(".focus").forEach(function (element) {
    // rm focus class
    element.classList.remove("focus");
  });
  if (ae) {
    ae.focus();
    document.activeElement = current_elem = ae;
    ae.parentElement.classList.add("focus");
  } else {
    document.activeElement.parentElement.classList.add("focus");
  }
}

function reset() {
  resultsAvailable = false;
  resList.innerHTML = sInput.value = ""; // clear inputbox and searchResults
  sInput.focus(); // shift focus to input box
}

// Run the search whenever the text changes. "input" rather than keyup, so a
// paste from the context menu, autofill, drag and drop or speech input also
// searches, and keys that change nothing (arrows, Shift) do not re-run it.
function runSearch() {
  if (index) {
    // No real query is this long; a paste that is costs no more than one.
    const query = sInput.value.trim().slice(0, 200);
    // Posts with every word first; if none has them all, posts with any.
    let found = index.search(query);
    if (!found.length) found = index.search(query, { combineWith: "OR" });
    const results = found.slice(0, params.limit).map(function (r) {
      return pages[r.id];
    });
    if (results.length !== 0) {
      // build our html if result exists
      let resultSet = ""; // our results bucket

      for (let item in results) {
        resultSet +=
          `<li class="post-entry"><header class="entry-header">${results[item].title}&nbsp;»</header>` +
          `<a href="${results[item].permalink}" aria-label="${results[item].title}"></a></li>`;
      }

      resList.innerHTML = resultSet;
      resultsAvailable = true;
      first = resList.firstChild;
      last = resList.lastChild;
    } else {
      resultsAvailable = false;
      resList.innerHTML = "";
    }
    // For assets/js/analytics.js: only the count, never the query.
    sInput.dispatchEvent(new CustomEvent("searchresults", { detail: { count: results.length } }));
  }
}
sInput.addEventListener("input", runSearch);

sInput.addEventListener("search", function (e) {
  // clicked on x
  if (!this.value) reset();
});

// kb bindings
document.onkeydown = function (e) {
  // Keys typed into an IME, or already handled (Esc in the keyboard
  // shortcuts list closes that list only).
  if (e.defaultPrevented || e.isComposing || e.keyCode === 229 ||
    document.querySelector("dialog[open]")) return;
  let key = e.key;
  let ae = document.activeElement;

  let inbox = document.getElementById("searchbox").contains(ae);
  // Esc elsewhere on the page is not the search's to handle.
  if (!inbox) return;

  if (ae === sInput) {
    let elements = document.getElementsByClassName("focus");
    while (elements.length > 0) {
      elements[0].classList.remove("focus");
    }
  } else if (current_elem) ae = current_elem;

  if (key === "Escape") {
    // A second Esc in an empty box leaves it, so the page's keyboard
    // shortcuts (assets/js/shortcuts.js) work on pages that autofocus search.
    if (document.activeElement === sInput && !sInput.value) sInput.blur();
    else reset();
  } else if (!resultsAvailable) {
    return;
  } else if (key === "ArrowDown") {
    e.preventDefault();
    if (ae == sInput) {
      // if the currently focused element is the search input, focus the <a> of first <li>
      activeToggle(resList.firstChild.lastChild);
    } else if (ae.parentElement != last) {
      // if the currently focused element's parent is last, do nothing
      // otherwise select the next search result
      activeToggle(ae.parentElement.nextSibling.lastChild);
    }
  } else if (key === "ArrowUp") {
    e.preventDefault();
    if (ae.parentElement == first) {
      // if the currently focused element is first item, go to input box
      activeToggle(sInput);
    } else if (ae != sInput) {
      // if the currently focused element is input box, do nothing
      // otherwise select the previous search result
      activeToggle(ae.parentElement.previousSibling.lastChild);
    }
  } else if (key === "ArrowRight") {
    ae.click(); // click on active link
  }
};
