# @bonniernews/eslint-config

[![Test application](https://github.com/BonnierNews/eslint-config/actions/workflows/run-tests.yml/badge.svg?branch=master)](https://github.com/BonnierNews/eslint-config/actions/workflows/run-tests.yml)

Basic [ESLint](https://eslint.org/) rules used by [Bonnier News](https://www.bonniernews.se). The configuration works both with CommonJS and ES6 modules,
and the appropriate setup will be used by looking at the projects `package.json` [type property](https://nodejs.org/api/packages.html#type).

For Node versions that support it (version 16 and above), the `es2022` environment will also be activated. Otherwise `es2021` will be used.

> **Note:** As of version 3.X, this package is published as an ES Module. See the [usage examples](#usage) for how to use it in both ESM and CommonJS projects.

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
    - [Global ignores](#global-ignores)
    - [Globals](#globals)
  - [Safety rules](#safety-rules)
    - [What the rules need from your project](#what-the-rules-need-from-your-project)
    - [What these rules cannot see](#what-these-rules-cannot-see)
    - [If a rule reports something wrong](#if-a-rule-reports-something-wrong)
  - [Migrating from 2.X to 3.X](#migrating-from-2x-to-3x)
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

**ESM** - for projects with `"type": "module"` in `package.json`:

```javascript
// eslint.config.js
import config from "@bonniernews/eslint-config";

export default config;
```

**CommonJS** - for projects without `"type": "module"`:

```javascript
// eslint.config.js
const { default: config } = await import("@bonniernews/eslint-config");

module.exports = config;
```

### JavaScript configuration

```javascript
// eslint.config.js
import config from "@bonniernews/eslint-config/js";

export default [ config ];
```

### TypeScript configuration

```javascript
// eslint.config.js
import config from "@bonniernews/eslint-config/ts";

export default [ config ];
```

### React configuration

```javascript
// eslint.config.js
import config from "@bonniernews/eslint-config/jsx";

export default [ config ];
```

### Test configuration

Adds useful plugins and globals for testing with mocha-cakes-2 + chai.

For JavaScript tests:

```javascript
// eslint.config.js
import config from "@bonniernews/eslint-config/test-js";

export default [ config ];
```

For TypeScript tests:

```javascript
// eslint.config.js
import config from "@bonniernews/eslint-config/test-ts";

export default [ config ];
```

### Typed react configuration

```javascript
// eslint.config.js
import config from "@bonniernews/eslint-config/tsx";

export default [ config ];
```

### Global ignores

To activate this config (in addition to other config(s), using it alone makes no sense), add the following:

```javascript
// eslint.config.js
import ignores from "@bonniernews/eslint-config/ignores";

export default [
  ...allYourGoodConfigs,
  ignores,
  // your additional config
];
```

### Globals

Globals for browsers, etc. that may be needed.

```javascript
// eslint.config.js
import globals from "@bonniernews/eslint-config/globals";

export default [
  ...allYourGoodConfigs,
  { files: [ "assets/scripts/**/*.js" ], languageOptions: { globals: globals.browser } },
];
```

## Safety rules

A test suite that resolves its configuration to a real environment can reach that environment's
data, and a reset helper pointed at it will do what it was asked to. The controls that prevent that
live outside this package: the network guard is
[`@bonniernews/stayput`](https://github.com/BonnierNews/stayput), the environment pin is the
import-free file your test runner loads first, and the last line of defence is database roles that
cannot drop anything.

This package ships the layer that notices when one of those is missing. The rules are part of the
configs you already use and they are all warnings. Treat them as a smoke alarm rather than a lock:
they read one file's syntax at a time, so they catch the ordinary mistake and not a determined
workaround.

| Rule | What it reports |
| --- | --- |
| `bn-safety/require-test-guards` | The project's mocha config, and the files it loads, neither load `@bonniernews/stayput/register` nor pin `NODE_CONFIG_ENV` to `"test"`. |
| `bn-safety/gitignore-env` | No `.gitignore` between the file and the repository root excludes `.env`, so a file of local credentials can be committed. |
| `bn-safety/env-pin-must-not-import` | A file pins the test environment and also imports or requires a module. Those run first, so the module reads the environment before the pin applies. |
| `bn-safety/no-env-pin-tampering` | Code sets `STAYPUT_ALLOW`, `STAYPUT_DENY` or `STAYPUT_DISABLE`, passes `allow` or `deny` to `stayput.enable()`, or turns on `ALLOW_TEST_ENV_OVERRIDE`. |
| `bn-safety/no-remote-db-target` | A test spells out a database host outside this machine, or turns off TLS certificate verification. |
| `bn-safety/no-credentials-in-source` | A connection string carries its own password, a private key is pasted into a file, or a `password`-style property or class field holds a real-looking value. |
| `bn-safety/no-widened-nock` | `enableNetConnect()` is called with no argument, or with one that allows every host, which re-enables every outbound http request. |
| `bn-safety/no-dotenv-override` | dotenv is loaded with `override: true`, which replaces variables a test runner already pinned. |

The first two look at the project rather than at the file being linted. They stay silent unless
`package.json` depends on a database, cache or message broker client, and they report once per
project rather than once per test file. A library has nothing to guard, so it is not asked to install
a guard.

The rules that look at tests apply to files under `test/`, `tests/`, `spec/` and `__tests__/`, and to
files named `*.test.js` or `*.spec.js`, in JavaScript and TypeScript alike.

### What the rules need from your project

All of it is in the [node-starterapp](https://github.com/BonnierNews/node-starterapp) template, and
merging that template is the easiest way to satisfy these rules:

- `@bonniernews/stayput/register` in the `require` list in `.mocharc.json`, or imported by a file in
  that list.
- An import-free file, also in that list, containing `process.env.NODE_CONFIG_ENV = "test";`. It has
  to be that variable: `exp-config` prefers it over `NODE_ENV`, so pinning only `NODE_ENV` still
  loads production configuration when `NODE_CONFIG_ENV` leaks in from a shell.
- `.env` in `.gitignore` (`.env`, `.env*`, `*.env` and `**/.env` all count), and no production hosts
  or credentials in that file.
- Test databases that run on this machine. Publish container ports to `127.0.0.1` rather than
  reaching a container by its own address.

### What these rules cannot see

Worth knowing, so nobody mistakes a green lint run for a guarantee:

- **They can be turned off.** Any repo can set them to `"off"` in its own `eslint.config.js`. These
  rules steer, they do not enforce. The controls that enforce are stayput at connect time and
  database roles at the server.
- **A host that comes from configuration is invisible**, which is the case that matters most. A
  literal `postgres://orders-db.prod.example.com/orders` in a test is reported;
  `` `postgres://${config.dbHost}/orders` `` cannot be judged here and is deliberately left alone.
  Only stayput sees the host that is actually dialled.
- **Only the plain shapes of a variable assignment are recognised.** `process.env.X = …`,
  `process.env["X"] = …` and `globalThis.process.env.X = …` are; `const { env } = process` and
  `Object.assign(process.env, …)` are not.
- **`eslint --cache` hides the project checks.** A cached file is never handed to a rule, so removing
  the guard from a mocha config goes unreported until a test file changes. Run lint in CI without
  `--cache` if you rely on `require-test-guards`.
- **A guard loaded some other way looks missing.** `require-test-guards` reads the mocha config and
  the files it loads. A guard injected through `NODE_OPTIONS` in CI, or a mocha config that builds
  its require list in code, is not visible, so the rule can report a project that is in fact guarded.
- **Only JavaScript and TypeScript are linted.** A secret in `.env`, in `config/production.json`, in
  a Terraform variables file or in a committed service-account key is invisible to any lint rule.
  That needs a file scanner in CI, plus GitHub secret scanning and push protection, which is also the
  only layer that stops a secret before it reaches the remote.
- **A tunnel to production on `localhost` looks local** to every one of these rules, as it does to
  stayput. Database roles are what remains.

### If a rule reports something wrong

Open an issue or a pull request here. If you need to move on in the meantime, disable the rule for
that line with a reason, so the next reader knows why:

```javascript
// eslint-disable-next-line bn-safety/no-remote-db-target -- mocked by nock, see BN-1234
```

One request: when a test fails because stayput refused a connection, or one of these rules reports a
host outside this machine, the target is usually the problem and not the guard. Fix the target rather
than widening the guard, and let a human decide about any exception.

## Migrating from 2.X to 3.X

Version 3.X is published as an ES Module (ESM).

### For ESM projects using `import`

If your project has `"type": "module"` in `package.json`, and you're already using `import`, then you don't have to make any changes.

### For CommonJS projects using `require`

If your project does not have `"type": "module"`, you need to use dynamic `import()` to import an ESM module, which is an asynchronous function:

**Before (2.X):**

```javascript
"use strict";

const config = require("@bonniernews/eslint-config");

module.exports = [
  ...config,
  { ignores: [ "dist/**" ] },
]
```

**After (3.X):**

```javascript
const { default: config } = await import("@bonniernews/eslint-config");

module.exports = [
  ...config,
  { ignores: [ "dist/**" ] },
]
```

## Migrating from 1.X to 2.X

2.X introduces eslint 9 which has a different configuration format. It is recommended to read the [eslint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide).

A major change from eslint 8 is that only one `eslint.config.js` file will be used, placing a specific configuration file in a folder will not behave in the same
way as in 8 where it would inherit the configuration from files from the root folder, and the new recommendation is to just have one `eslint.config.js` at the root
of the repository.

One major change from eslint 8 is that in order for ignores to be global they need to be added in a single config at the root level. If you just use the `@bonniernews/eslint-config`
you will have it included, but if you construct your own set of rules you need to add it manually to your config file, otherwise eslint will run on files in terraform directories and such.

The different rule sets have changed name and behaviour:

* `@bonniernews/eslint-config` will import configs and apply them to the respective targets
* `@bonniernews/eslint-config/js` config for js files
* `@bonniernews/eslint-config/ts` config for ts files
* `@bonniernews/eslint-config/jsx` config for jsx files
* `@bonniernews/eslint-config/tsx` config for tsx files
* `@bonniernews/eslint-config/test-js` config for test js files using mocha-cakes-2 and chai
* `@bonniernews/eslint-config/test-ts` config for test ts files using mocha-cakes-2 and chai
* `@bonniernews/eslint-config/ignores` global ignores

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
  in the `@bonniernews/eslint-config/test-js` and `@bonniernews/eslint-config/test-ts` configs.

Once you complete the steps above run the following:

```sh
npx eslint . --fix
```

## Usage with Prettier

If you want to use _Prettier_, run it before eslint. ESLint should be the final judge, i.e. run:

```sh
npx prettier --write .
npx eslint . --fix
```

This will format the entire code base according to the rules of _Prettier_ and the config.

## Enable format on save

- [Visual Studio Code](EDITORS.md#visual-studio-code)

## Changelog

Can be found [here](CHANGELOG.md).

## Publishing a new version

We automatically publish to both NPM and GitHub when you bump the version in package.json

## License

Released under the [MIT license](https://tldrlegal.com/license/mit-license).
