import { FieldAction } from "@frontmatter/extensibility";
import * as fs from "fs";

(async () => {
  const { frontMatter } = FieldAction.getArguments();

  if (!frontMatter.title) {
    FieldAction.done();
    return;
  }

  // add 1 to offset the index file
  const logNumber = fs.readdirSync("./content/dailies").length - 1;

  FieldAction.update("#" + logNumber + " " + frontMatter.title);
})();
