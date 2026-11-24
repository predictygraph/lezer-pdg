V ?= patch

.PHONY: generate build test check release

generate:
	npm run generate

build:
	npm run build

test:
	npm test

check:
	npm run check

release: generate check test
	git diff --exit-code src/parser.ts src/parser.terms.ts
	npm version $(V) -m "chore: release %s"
	git push --follow-tags
