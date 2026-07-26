import { ContentScript } from "@frontmatter/extensibility";
import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// Front Matter runs this with cwd = workspace root and JSON.parses our whole
// stdout, so nothing else may be written to stdout. Diagnostics go to stderr.
const { workspacePath, filePath, frontMatter } = ContentScript.getArguments();

// Output that is not JSON with a `frontmatter` key falls through to a VS Code
// notification showing the raw text, which is exactly what we want for errors.
const fail = (message) => {
  console.log(message);
  process.exit(0);
};

const resolveClaude = () => {
  const candidates = [
    process.env.CLAUDE_BIN,
    path.join(os.homedir(), ".local/bin/claude"),
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
  ].filter(Boolean);
  return candidates.find((c) => fs.existsSync(c)) || "claude";
};

const title = frontMatter?.title;
if (!title) {
  fail("Give the book a title first — that is what gets looked up.");
}

const slug = path.basename(filePath).replace(/\.[^.]+$/, "");
const known = frontMatter?.bookMeta || {};

const prompt = [
  `/book-metadata`,
  `Title: "${title}".`,
  known.author ? `Author: ${known.author}.` : ``,
  known.isbn ? `The user owns ISBN ${known.isbn} — use that edition.` : ``,
  `Page slug: ${slug} — name the cover file after it.`,
]
  .filter(Boolean)
  .join(" ");

// --json-schema takes the schema inline, not a path.
const schema = fs.readFileSync(
  path.join(workspacePath, "scripts/frontmatter/book-metadata.schema.json"),
  "utf8",
);

let raw;
try {
  raw = execFileSync(
    resolveClaude(),
    [
      "-p",
      prompt,
      "--output-format",
      "json",
      "--json-schema",
      schema,
      "--permission-mode",
      "acceptEdits",
      "--allowedTools",
      "Bash,Read,Write,Glob,Grep,WebFetch,WebSearch,mcp__playwright",
    ],
    {
      cwd: workspacePath,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
} catch (e) {
  fail(`Claude Code failed: ${(e.stderr || e.message || "").toString().trim()}`);
}

let result;
try {
  result = JSON.parse(raw).structured_output;
} catch {
  fail("Could not parse the Claude Code response.");
}
if (!result?.bookMeta) {
  fail("Claude Code returned no book metadata.");
}

// Front Matter merges the returned keys shallowly, so bookMeta has to be sent
// whole. Researched values win; rating stays the user's.
ContentScript.updateFrontMatter({
  summary: result.summary || frontMatter?.summary || "",
  bookMeta: {
    ...known,
    ...Object.fromEntries(
      Object.entries(result.bookMeta).filter(
        ([, v]) => v !== "" && v !== 0 && !(Array.isArray(v) && !v.length),
      ),
    ),
    rating: known.rating ?? 0,
  },
});

if (result.notes) {
  console.error(result.notes);
}
