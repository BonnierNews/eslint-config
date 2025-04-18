# Changelog

## 2.0.2

- Fixed bad docs.

## 2.0.1

- Switched to released 1.0.0 of `@bonniernews/eslint-plugin-typescript-rules`.

## 2.0.0

- Breaking change: switch from eslint 8 to eslint 9 and adapt to the new flat file config format.
- Breaking change: removed `all`, `test` and `typescript-react` configs. Just importing the index config
  will enable all configs. For just the specific configs import `@bonniernews/eslint-config/js`,
  `@bonniernews/eslint-config/ts`, `@bonniernews/eslint-config/jsx`, `@bonniernews/eslint-config/test-js`,
  `@bonniernews/eslint-config/test-ts`, or `@bonniernews/eslint-config/tsx`. When creating your own set of
  rules different globals (as an example `globals.browser`) is available from `@bonniernews/eslint-config/globals`.

## 1.2.0

- Bumped `typescript` to 5.4.3 and `@typescript-eslint` to 7.4.0.

## 1.1.1

- Include lowercase `describe` and `context` blocks in `no-only-tests/no-only-tests`.

## 1.1.0

- Add rule `react/jsx-curly-spacing` to align jsx curly with js curly.
- Bumped `eslint-plugin-react`, `eslint-plugin-import` and `eslint-plugin-n`.
- Moved TypeScript restricted syntax to a seperate package `@bonniernews/typescript-rules`.
- Uses `@bonniernews/typescript-rules` for TypeScript.
- Added `@bonniernews/typescript-rules/disallow-class-extends` also for non-typescript.

## 1.0.2

- Run tests on all supported node versions
- Bump `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`.
- Use typescript 5.3 for tests

## 1.0.1

- Loosen react/jsx-max-props-per-line to allow as many props the developer wants on
  a single line but enforce 1 prop per line if using multiple lines.

## 1.0.0

- Renamed to @bonniernews/eslint-config

## 0.8.3

- fixed typescript-react rules to actually check .ts files
- disabled import/named for typescript

## 0.8.2

- bump typescript deps

## 0.8.1

- fixed broken release

## 0.8.0

- tsx support by using `exp/typescript-react`
- removed warning for explicit anys

## 0.7.0

- TypeScript rules.
- Bumped major version of `eslint-plugin-n` to 16.
- Bumped major version of `eslint-plugin-no-only-tests` to 3.
- Bumped required node version to 16.
- Added TypeScript as an optional peer dependency.

## 0.6.2

- Allow deprecated url.resolve and url.parse since new URL has unacceptable performance regressions, see <https://github.com/nodejs/node/issues/30334>.

## 0.6.1

- Added `"react/jsx-indent-props": [2, 2]` as a rule for react to make indenting jsx props look nice.

## 0.6.0

- Added support for react using `exp/react`.

## 0.5.0

Add deprecated rules for node.

## 0.4.0

- Replace `eslint-plugin-node` with `eslint-plugin-n` as the former is no longer maintained.

## 0.3.0

Added missing afterEachFeature & beforeEachFeature globals for `mocha-cakes-2`.

## 0.2.0

- Added support for ES6 module linting, which is activated if `"type": "module"` in your `package.json`
- For Node versions 16 and above, the ES2022 environment will be activated
- A new configuration `exp/all` has been added, which adds the test configuration directly in the main `.eslintrc.json`

## 0.1.1

Consistent spacing for functions and code blocks.

## 0.1.0

New rules to format objects: either all properties on the same line OR use multiline.

## 0.0.9

Updated `eslint` peer dependency to v8.

## 0.0.8

`eslint-plugin-node` is now included in the package and has migrated the following rules:

- `node/handle-callback-err`
- `node/no-path-concat`
- `node/no-process-exit`

Behavior remains unchanged.

## 0.0.7

`function` is now exempt from the `comma-dangle` rule.

## 0.0.6

Add the `comma-dangle` rule with `always-multiline`.

## 0.0.5

Add the switch-colon-spacing rule.

## 0.0.4

Remove some ignorePatterns that shouldn't be ignored.

## 0.0.3

No changes. Fixes bad publish.

## 0.0.2

Use new-cap in standard configuration.

## 0.0.1

Initial working version.
