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
