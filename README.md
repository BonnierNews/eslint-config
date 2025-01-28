# @bonniernews/eslint-config

[![Test application](https://github.com/BonnierNews/eslint-config/actions/workflows/run-tests.yml/badge.svg?branch=master)](https://github.com/BonnierNews/eslint-config/actions/workflows/run-tests.yml)

Basic [ESLint](https://eslint.org/) rules used by [Bonnier News](https://www.bonniernews.se). The configuration works both with CommonJS and ES6 modules,
and the appropriate setup will be used by looking at the projects `package.json` [type property](https://nodejs.org/api/packages.html#type).

For Node versions that support it (version 16 and above), the `es2022` environment will also be activated. Otherwise `es2021` will be used.

## Usage

Install `eslint` and `@bonniernews/eslint-config`:

```bash
npm install --save-dev eslint @bonniernews/eslint-config
```

## Migrating from 1.X to 2.X

2.X introduces eslint 9 which has a different configuration format. It is recommended to read the [eslint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide).

A major change from eslint 8 is that only one `eslint.config.js` file will be used, placing a specific configuration file in a folder will not behave in the same
way as in 8 where it would inherit the configuration from files from the root folder, and the new recommendation is to just have one `eslint.config.js` at the root
of the repository.

As well as changing the configuration format to adapt to eslint 9, @bonniernews/eslint-config has removed some of the previous configuration options `all`, `test`, `react`
and `typescript-react` have all been removed. Now there are only two, the base (js only) and `typescript` which is the base with added support for `ts` and `tsx`.

### JavaScript configuration

This config includes support for `js`, `jsx` and tests written using `mocha-cakes-2` and `chai`.

To activate the config, you need to add the following to your `eslint.config.js`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config");
```

### TypeScript configuration

This config includes support for `js`, `jsx`, `ts`, `tsx` and and tests written using `mocha-cakes-2` and `chai`.

To activate the config, you need to add the following to your `.eslintrc.json`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config/typescript");
```

### Running eslint

Run with:

```bash
npx eslint .
```

## Usage in an existing project

- We advice to remove any `husky` hooks that uses libraries such as `pretty-quick` from your `package.json`
- Subsequently remove any use of `pretty-quick` if possible.
- Remove any previous use of sharable [_ESLint_ configs](https://eslint.org/docs/developer-guide/shareable-configs) from `package.json`, i.e.:
  - `eslint-config-airbnb`
  - `eslint-config-google`
  - `eslint-config-prettier`
- Remove `eslint-plugin-prettier` from `package.json`
- If you get errors similar to the ones below, please update the `eslint` dependancy.
  - _Definition for rule 'no-nonoctal-decimal-escape' was not found_
  - _Definition for rule 'no-unsafe-optional-chaining' was not found_
- If you still have issues; try updating `npm` (if you use _nvm_ `nvm install-latest-npm`) & `prettier` as-well
- Remove any 'eslint-disable-line no-unused-expressions' directives added because of chai assertions, they are not
  needed anymore (`eslint-plugin-chai-friendly` is used in test).
- Remove any globals and special rules related to `mocha-cakes-2` in your test configuration, they already exist
  in the `@bonniernews/eslint-config/test` and `@bonniernews/eslint-config/all` configs.

Once you complete the steps above run the following:

```sh
npx eslint . --fix
```

## Usage with Prettier

If you want to use _Prettier_, run it before eslint. ESLint should be the final judge, i.e. run:

```sh
npx prettier --save .
npx eslint . --fix
```

This will format the entire code base according to the rules of _Prettier_ and the config.

## Enable format on save

- [Visual Studio Code](EDITORS.md#visual-studio-code)

## Changelog

Can be found [here](CHANGELOG.md).

## License

Released under the [MIT license](https://tldrlegal.com/license/mit-license).
