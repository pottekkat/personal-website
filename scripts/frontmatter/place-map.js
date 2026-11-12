import { ContentScript } from "@frontmatter/extensibility";
import { execFileSync } from "child_process";
import * as path from "path";

// "Draw map" on a Place page: runs scripts/places/city-map.mjs on the
// page's bundle, which writes map.svg and cover.jpg next to _index.md, then
// sets `map: "map.svg"`, which the Front Matter dashboard shows on the card.
// The first map is centred on the page's title; save the page first, the map
// script reads the title from the file on disk. To centre it somewhere else,
// run the script by hand with --near (see the top of city-map.mjs).
//
// Front Matter JSON.parses our whole stdout, so only the result goes there.
const { workspacePath, filePath, frontMatter } = ContentScript.getArguments();

// Output that is not JSON with a `frontmatter` key shows up as a VS Code
// notification, which is what we want for errors.
const fail = (message) => {
  console.log(message);
  process.exit(0);
};

if (!frontMatter?.title) {
  fail("Set a title and save the page first. The map is drawn around it.");
}

try {
  execFileSync(
    process.execPath,
    [path.join(workspacePath, "scripts/places/city-map.mjs"), path.dirname(filePath)],
    { cwd: workspacePath, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
} catch (e) {
  fail(`Could not draw the map: ${(e.stderr || e.message || "").toString().trim()}`);
}

ContentScript.updateFrontMatter({ map: "map.svg" });
