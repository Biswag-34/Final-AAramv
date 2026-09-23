import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("docs/SOURCE_MANIFEST.json", root), "utf8"));
const changed = [];
for (const [path, expected] of Object.entries(manifest.sha256)) {
  try {
    const actual = createHash("sha256").update(await readFile(new URL(path, root))).digest("hex");
    if (actual !== expected) changed.push(path);
  } catch { changed.push(path + " (missing)"); }
}
if (changed.length) {
  console.error("Files changed from the supplied website snapshot:\n" + changed.join("\n"));
  console.error("This is expected after you start customizing the project.");
  process.exitCode = 1;
} else {
  console.log(`Verified ${Object.keys(manifest.sha256).length} original files against website commit ${manifest.source_commit}.`);
}
