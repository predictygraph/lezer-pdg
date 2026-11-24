// SPDX-FileCopyrightText: 2026 Reza Jelveh
//
// SPDX-License-Identifier: Apache-2.0

import { ExternalTokenizer } from "@lezer/lr";
import { CssContent, Value } from "./parser.terms.ts";

const OPEN = 123; // {
const CLOSE = 125; // }
const EQ = 61; // =
const QUOTE = 34; // "
const DOLLAR = 36; // $
const SEMI = 59; // ;
const stops = new Set([32, 9, 10, 13, OPEN, CLOSE, QUOTE, SEMI]);

/** Bare value: after `=` (attributes, or `let x = v` with spaces), up to whitespace, a brace, `"` or `;`. */
export const bareValue = new ExternalTokenizer((input, stack) => {
  if (!stack.canShift(Value)) return;
  let back = -1;
  while (input.peek(back) === 32 || input.peek(back) === 9) back--;
  if (input.peek(back) !== EQ) return;
  if (input.next === DOLLAR || stops.has(input.next) || input.next < 0) return;
  let n = 0;
  while (input.next >= 0 && !stops.has(input.next)) {
    input.advance();
    n++;
  }
  if (n) input.acceptToken(Value);
});

/** `{ ... }` after `css`, braces balanced, as one token. Only where the parser expects it. */
export const cssBody = new ExternalTokenizer((input, stack) => {
  if (input.next !== OPEN || !stack.canShift(CssContent)) return;
  let depth = 0;
  for (;;) {
    if (input.next < 0) return; // unterminated: let the normal tokens report it
    if (input.next === OPEN) depth++;
    else if (input.next === CLOSE && --depth === 0) {
      input.advance();
      input.acceptToken(CssContent);
      return;
    }
    input.advance();
  }
});
