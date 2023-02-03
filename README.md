# eslint-config-exp

[![Test application](https://github.com/BonnierNews/eslint-config-exp/actions/workflows/run-tests.yml/badge.svg?branch=master)](https://github.com/BonnierNews/eslint-config-exp/actions/workflows/run-tests.yml)

Basic [ESLint](https://eslint.org/) rules used by [Expressen](https://www.expressen.se). The configuration works both with CommonJS and ES6 modules,
and the appropriate setup will be used by looking at the projects `package.json` [type property](https://nodejs.org/api/packages.html#type).

For Node versions that support it (version 16 and above), the `es2022` environment will also be activated. Otherwise `es2021` will be used.

## Usage

Install `eslint` and `eslint-config-exp`:

```bash
npm install --save-dev eslint eslint-config-exp
```

### Base configuration

To activate the config, you need to add the following to your `.eslintrc.json`-file:

```json
{
  "root": true,
  "extends": [ "exp" ]
}
```

### React configuration

To activate the config, you need to add the following to your `.eslintrc.json`-file:

```json
{
  "root": true,
  "extends": [ "exp/react" ]
}
```

This will enable the react plugin for `*.jsx`-files.

### Test configuration

You can also choose to use the test config, which is adapted to testing using `mocha`, `mocha-cakes-2` and `chai`. To also enable this,
either add a separate test configuration file extending from `"exp/test"`, or use the `"exp/all"` in your root configuration to activate
everything together:

```json
{
  "root": true,
  "extends": [ "exp/all" ]
}
```

This will activate the test configuration for all files inside directories named `test` or `tests`.

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
  in the `eslint-config-exp/test` and `eslint-config-exp/all` configs.

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
