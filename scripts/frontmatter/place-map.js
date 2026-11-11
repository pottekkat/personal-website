import { ContentScript } from "@frontmatter/extensibility";
import { execFileSync } from "child_process";
import * as path from "path";

// "Draw city map" on a Place page: runs scripts/places/city-map.mjs on the
// page's bundle, which writes map.svg next to _index.md, then writes the
// map's centre back into lat/lon. Save the page first: the map script reads
// city, lat, lon and mapWidth from the file on disk.
//
// Front Matter JSON.parses our whole stdout, so only the result goes there.
const { workspacePath, filePath, frontMatter } = ContentScript.getArguments();

// Output that is not JSON with a `frontmatter` key shows up as a VS Code
// notification, which is what we want for errors.
const fail = (message) => {
  console.log(message);
  process.exit(0);
};

if (!frontMatter?.city) {
  fail("Set a city and save the page first. The map is drawn around it.");
}

let out;
try {
  out = execFileSync(
    process.execPath,
    [path.join(workspacePath, "scripts/places/city-map.mjs"), path.dirname(filePath)],
    { cwd: workspacePath, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
} catch (e) {
  fail(`Could not draw the map: ${(e.stderr || e.message || "").toString().trim()}`);
}

let centre;
try {
  centre = JSON.parse(out.trim().split("\n").pop());
} catch {
  fail("The map script returned no coordinates.");
}

ContentScript.updateFrontMatter({ lat: centre.lat, lon: centre.lon });
