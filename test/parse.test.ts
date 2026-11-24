// SPDX-FileCopyrightText: 2026 Reza Jelveh
//
// SPDX-License-Identifier: Apache-2.0

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { parser } from "../src/index.ts";

/** Node names in document order, plus every error position. */
function walk(src: string) {
  const names: string[] = [];
  const errors: number[] = [];
  parser.parse(src).iterate({
    enter: (n) => {
      if (n.type.isError) errors.push(n.from);
      else names.push(n.name);
    },
  });
  return { names, errors };
}

function errorsWithContext(src: string, errors: number[]) {
  return errors.map((at) => JSON.stringify(src.slice(Math.max(0, at - 30), at + 30)));
}

test("nodes, edges, labels, classes, attributes", () => {
  const { names, errors } = walk('a "Hello" .green width=120\na, b -> c "go" color=#fff\n');
  assert.deepEqual(errors, []);
  for (const n of ["NodeStatement", "EdgeStatement", "String", "Class", "AttributeName", "Value", "Arrow"]) assert.ok(names.includes(n), n);
});

test("css block nests CSS", () => {
  const src = "css {\n  node { fill: #fff; }\n  .a { stroke: red; }\n}\n";
  const { names, errors } = walk(src);
  assert.deepEqual(errors, []);
  assert.ok(names.includes("CssContent"));
  const tree = parser.parse(src);
  assert.equal(tree.resolveInner(src.indexOf("fill") + 1, 1).name, "PropertyName", "CSS parsed inside css { }");
});

test("bracket, legend, keywords as ids", () => {
  const { names, errors } = walk('group node "GPU node" {\n  edge\n}\nbracket a, b "x" .c\nlegend .hami "HAMi"\nlegend "Key"\n');
  assert.deepEqual(errors, []);
  for (const n of ["Group", "BracketStatement", "LegendStatement"]) assert.ok(names.includes(n), n);
});

test("let/def/use and $variables", () => {
  const src = 'let c = 12px\ndef gpu name="GPU" top=empty {\n  t "$name" .$top height=$c\n}\nuse gpu g0 name="GPU 0"\n';
  const { names, errors } = walk(src);
  assert.deepEqual(errors, []);
  for (const n of ["LetStatement", "DefStatement", "Parameter", "UseStatement", "Variable"]) assert.ok(names.includes(n), n);
});

test("# comment vs #hex", () => {
  const { names, errors } = walk("# a comment\na color=#fff # trailing\n");
  assert.deepEqual(errors, []);
  assert.equal(names.filter((n) => n === "Comment").length, 2);
});

const examples = process.env.PDG_EXAMPLES;
test("every predictygraph example parses", { skip: !examples && "set PDG_EXAMPLES=<predictygraph>/examples" }, () => {
  const files: string[] = [];
  const scan = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) scan(join(d, e.name));
      else if (e.name.endsWith(".pdg")) files.push(join(d, e.name));
    }
  };
  scan(examples as string);
  assert.ok(files.length > 0);
  const bad = files.flatMap((f) => {
    const src = readFileSync(f, "utf8");
    const { errors } = walk(src);
    return errors.length ? [`${f}: ${errorsWithContext(src, errors).slice(0, 3).join(" | ")}`] : [];
  });
  assert.deepEqual(bad, [], `${bad.length}/${files.length} files with errors`);
});
