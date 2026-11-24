// SPDX-FileCopyrightText: 2026 Reza Jelveh
//
// SPDX-License-Identifier: Apache-2.0

import { css } from "@codemirror/lang-css";
import { delimitedIndent, foldInside, foldNodeProp, indentNodeProp, LanguageSupport, LRLanguage } from "@codemirror/language";
import { parseMixed } from "@lezer/common";
import { styleTags, tags as t } from "@lezer/highlight";
import { parser as baseParser } from "./parser.ts";

const cssLang = css().language;

/** Lezer parser for .pdg with highlighting, folding and indentation props. */
export const parser = baseParser.configure({
  props: [
    styleTags({
      "graph css default group let def use node edge bracket legend": t.keyword,
      DefName: t.function(t.definition(t.variableName)),
      "Group/Identifier UseStatement/Identifier": t.namespace,
      NodeName: t.variableName,
      VariableName: t.definition(t.variableName),
      ParameterName: t.definition(t.variableName),
      Variable: t.special(t.variableName),
      String: t.string,
      "CssImport/String": t.special(t.string),
      Class: t.className,
      AttributeName: t.propertyName,
      Value: t.atom,
      Arrow: t.operator,
      "=": t.definitionOperator,
      "{ }": t.brace,
      ", ;": t.separator,
      Comment: t.lineComment,
    }),
    foldNodeProp.add({ "Block CssContent": foldInside }),
    indentNodeProp.add({ Block: delimitedIndent({ closing: "}" }) }),
  ],
  // css { ... }: the text between the outer braces is CSS
  wrap: parseMixed((node) =>
    node.name === "CssContent" && node.to - node.from > 2
      ? { parser: cssLang.parser, overlay: [{ from: node.from + 1, to: node.to - 1 }] }
      : null,
  ),
});

export const pdgLanguage = LRLanguage.define({
  name: "pdg",
  parser,
  languageData: {
    commentTokens: { line: "#" },
    closeBrackets: { brackets: ["{", '"'] },
  },
});

/** CodeMirror 6 support for predictygraph: `extensions: [pdg()]`. */
export function pdg(): LanguageSupport {
  return new LanguageSupport(pdgLanguage, [cssLang.data.of({})]);
}
