import { FieldAction } from "@frontmatter/extensibility";
import * as fs from "fs";

(async () => {
  const { frontMatter } = FieldAction.getArguments();

  if (!frontMatter.title) {
    FieldAction.done();
    return;
  }

  const logNumber = fs.readdirSync("./content/dailies").length

  FieldAction.update("#" + logNumber + " " + frontMatter.title);
})();
