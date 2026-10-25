import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const references = new Map();
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
}
function add(value, source) {
  if (/^(?:images|certificates|fonts)\//.test(value) || /^[^/]+\.pdf$/i.test(value)) {
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    references.set(clean, source);
  }
}
for (const folder of ["components", "content", "app"]) {
  for (const file of walk(join(root, folder))) {
    if (/\.tsx?$/.test(file)) {
      const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
      const visit = node => {
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) add(node.text, file);
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }
}
for (const [path, source] of references) {
  assert.ok(existsSync(join(root, "public", path)), `Missing public asset ${path}, referenced by ${source}`);
}
const htmlFiles = walk(join(root, "out")).filter(file => file.endsWith(".html"));
let exported = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    let url = match[1].replaceAll("&amp;", "&");
    if (!url.startsWith("/") || url.startsWith("//")) continue;
    url = decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\/Personal-Website(?=\/|$)/, "");
    const target = join(root, "out", url);
    assert.ok(existsSync(target) || existsSync(`${target}.html`), `Broken exported reference ${match[1]} in ${file}`);
    exported++;
  }
}
console.log(`Asset regression passed: ${references.size} source assets and ${exported} exported references across ${htmlFiles.length} HTML pages.`);
