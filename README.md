# eslint-config-exp

[![Test application](https://github.com/BonnierNews/eslint-config-exp/actions/workflows/run-tests.yml/badge.svg?branch=master)](https://github.com/BonnierNews/eslint-config-exp/actions/workflows/run-tests.yml)

Basic [ESLint](https://eslint.org/) rules used by [Expressen](https://www.expressen.se).

## Usage

Install `eslint` and `eslint-config-exp`:

```bash
npm install --save-dev eslint eslint-config-exp
```

Then you need to add the following to your `.eslintrc.json`-file:

```json
{
  "root": true,
  "extends": [ "exp" ]
}
```

The configuration will look at the [type property](https://nodejs.org/api/packages.html#type) in your `package.json` to determine
whether ES6 module rules should be applied or not. For Node versions that support it, the `es2022` environment will also be activated.

You can also choose to use the test config, which is adapted to testing using `mocha`, `mocha-cakes-2` and `chai`. To also enable this,
add it to your config `extends` like:

```json
{
  "root": true,
  "extends": [ "exp", "exp/test" ]
}
```

This will activate the test configuration for all files inside directories named `test` or `tests`.

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
  in `eslint-config-exp/test`.

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
