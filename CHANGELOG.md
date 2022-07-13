# Changelog

## 0.2.1

- Replace `eslint-plugin-node` with `eslint-plugin-n` as the former is no longer maintained.

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
