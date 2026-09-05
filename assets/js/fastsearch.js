import * as params from "@params";

let fuse; // holds our search engine
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
          // fuse.js options; check fuse.js website for details
          let options = {
            distance: 100,
            threshold: 0.4,
            ignoreLocation: true,
            keys: ["title", "permalink", "summary", "content", "categories", "section"],
          };
          if (params.fuseOpts) {
            options = {
              isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
              includeScore: params.fuseOpts.includescore ?? false,
              includeMatches: params.fuseOpts.includematches ?? false,
              minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
              shouldSort: params.fuseOpts.shouldsort ?? true,
              findAllMatches: params.fuseOpts.findallmatches ?? false,
              keys: params.fuseOpts.keys ?? [
                "title",
                "permalink",
                "summary",
                "content",
                "categories",
                "section",
              ],
              location: params.fuseOpts.location ?? 0,
              threshold: params.fuseOpts.threshold ?? 0.4,
              distance: params.fuseOpts.distance ?? 100,
              ignoreLocation: params.fuseOpts.ignorelocation ?? true,
            };
          }
          fuse = new Fuse(data, options); // build the index from the json file
          // Someone may have typed while the index was still downloading.
          if (sInput.value.trim()) sInput.onkeyup.call(sInput);
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

// execute search as each character is typed
sInput.onkeyup = function (e) {
  // run a search query (for "term") every time a letter is typed
  // in the search box
  if (fuse) {
    const results = fuse.search(this.value.trim(), {
      limit: params.fuseOpts.limit,
    }); // the actual query being run using fuse.js
    if (results.length !== 0) {
      // build our html if result exists
      let resultSet = ""; // our results bucket

      for (let item in results) {
        resultSet +=
          `<li class="post-entry"><header class="entry-header">${results[item].item.title}&nbsp;»</header>` +
          `<a href="${results[item].item.permalink}" aria-label="${results[item].item.title}"></a></li>`;
      }

      resList.innerHTML = resultSet;
      resultsAvailable = true;
      first = resList.firstChild;
      last = resList.lastChild;
    } else {
      resultsAvailable = false;
      resList.innerHTML = "";
    }
  }
};

sInput.addEventListener("search", function (e) {
  // clicked on x
  if (!this.value) reset();
});

// kb bindings
document.onkeydown = function (e) {
  let key = e.key;
  let ae = document.activeElement;

  let inbox = document.getElementById("searchbox").contains(ae);

  if (ae === sInput) {
    let elements = document.getElementsByClassName("focus");
    while (elements.length > 0) {
      elements[0].classList.remove("focus");
    }
  } else if (current_elem) ae = current_elem;

  if (key === "Escape") {
    reset();
  } else if (!resultsAvailable || !inbox) {
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
