// SPDX-FileCopyrightText: 2026 Reza Jelveh
//
// SPDX-License-Identifier: Apache-2.0

// lezer-generator writes `from "./tokens"`; node --test and tsc want the .ts extension.
import { readFileSync, writeFileSync } from "node:fs";

const f = new URL("../src/parser.ts", import.meta.url);
writeFileSync(f, readFileSync(f, "utf8").replace(/from "\.\/tokens"/, 'from "./tokens.ts"'));
