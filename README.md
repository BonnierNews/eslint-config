# @bonniernews/eslint-config

[![Test application](https://github.com/BonnierNews/eslint-config/actions/workflows/run-tests.yml/badge.svg?branch=master)](https://github.com/BonnierNews/eslint-config/actions/workflows/run-tests.yml)

Basic [ESLint](https://eslint.org/) rules used by [Bonnier News](https://www.bonniernews.se). The configuration works both with CommonJS and ES6 modules,
and the appropriate setup will be used by looking at the projects `package.json` [type property](https://nodejs.org/api/packages.html#type).

For Node versions that support it (version 16 and above), the `es2022` environment will also be activated. Otherwise `es2021` will be used.

## Table of contents

- [@bonniernews/eslint-config](#bonniernewseslint-config)
  - [Table of contents](#table-of-contents)
  - [Usage](#usage)
    - [Configuring all rules](#configuring-all-rules)
    - [JavaScript configuration](#javascript-configuration)
    - [TypeScript configuration](#typescript-configuration)
    - [React configuration](#react-configuration)
    - [Test configuration](#test-configuration)
    - [Typed react configuration](#typed-react-configuration)
  - [Migrating from 1.X to 2.X](#migrating-from-1x-to-2x)
  - [Running eslint](#running-eslint)
  - [Usage in an existing project](#usage-in-an-existing-project)
  - [Usage with Prettier](#usage-with-prettier)
  - [Enable format on save](#enable-format-on-save)
  - [Changelog](#changelog)
  - [Publishing a new version](#publishing-a-new-version)
  - [License](#license)

## Usage

Install `eslint` and `@bonniernews/eslint-config`:

```bash
npm install --save-dev eslint @bonniernews/eslint-config
```

### Configuring all rules

Configures all rules, js, ts, tsx, jsx and test rules.

To activate the config, you need to add the following to your `eslint.config.js`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config");
```

### JavaScript configuration

To activate the config, you need to add the following to your `eslint.config.js`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config/js");
```

### TypeScript configuration

To activate the config, you need to add the following to your `eslint.config.js`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config/ts");
```

### React configuration

To activate the config, you need to add the following to your `eslint.config.js`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config/jsx");
```

### Test configuration

Adds useful plugins and globals for testing with mocha-cakes-2 + chai.

To activate the config, you need to add the following to your `eslint.config.js`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config/test");
```

### Typed react configuration

To activate the config, you need to add the following to your `eslint.config.js`-file:

```javascript
"use strict";

module.exports = require("@bonniernews/eslint-config/tsx");
```

## Migrating from 1.X to 2.X

2.X introduces eslint 9 which has a different configuration format. It is recommended to read the [eslint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide).

A major change from eslint 8 is that only one `eslint.config.js` file will be used, placing a specific configuration file in a folder will not behave in the same
way as in 8 where it would inherit the configuration from files from the root folder, and the new recommendation is to just have one `eslint.config.js` at the root
of the repository.

The different rule sets have changed name and behaviour:

* `@bonniernews/eslint-config` will import configs and apply them to the respective targets
* `@bonniernews/eslint-config/js` config for js files
* `@bonniernews/eslint-config/ts` config for ts files
* `@bonniernews/eslint-config/jsx` config for jsx files
* `@bonniernews/eslint-config/tsx` config for tsx files
* `@bonniernews/eslint-config/test` config for test files using mocha-cakes-2 and chai

## Running eslint

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

## Publishing a new version

1. Prepare the new version
2. Fill out the CHANGELOG
3. Ensure that package-lock, et al are up-to-date
4. Commit
5. Tag
6. Publish, when publishing ensure that you have a token in ~/.npmrc with auth for npm.pkg.github.com  as we publish both to our own registry and to the npm registry

## License

Released under the [MIT license](https://tldrlegal.com/license/mit-license).
