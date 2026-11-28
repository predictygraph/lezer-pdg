# lezer-pdg

[Lezer](https://lezer.codemirror.net/) grammar and [CodeMirror 6](https://codemirror.net/) language support for
[predictygraph](https://github.com/predictygraph/predictygraph) (`.pdg`) diagrams.

- Highlighting for keywords, node ids, labels, `.classes`, `key=value` attributes, arrows, `$variables`, `let`/`def`/`use`, `bracket`, `legend` and `#` comments (`#fff` stays a value).
- The body of `css { ... }` is parsed and highlighted as CSS.
- Folding and indentation for `{ }` blocks, `#` line comments, bracket closing.

Mirrors [tree-sitter-pdg](https://github.com/predictygraph/tree-sitter-pdg) and predictygraph's `docs/SPEC.md`.

## Use

```sh
npm install lezer-pdg
```

```js
import { EditorView, basicSetup } from "codemirror";
import { pdg } from "lezer-pdg";

new EditorView({ doc: 'a -> b "hello"\n', extensions: [basicSetup, pdg()], parent: document.body });
```

`parser` (the configured Lezer parser) and `pdgLanguage` are exported too, e.g. for
[@lezer/markdown](https://github.com/lezer-parser/markdown) code block nesting or
[lezer-decktile](https://github.com/decktile/lezer-decktile).

## Develop

```sh
npm ci
make generate   # src/pdg.grammar -> src/parser.ts (committed)
make check test
PDG_EXAMPLES=../predictygraph/examples npm test   # also parse every example
```

Release: `make release V=patch|minor|major` tags and pushes; the `release` workflow publishes to npm.

## License

Apache-2.0
