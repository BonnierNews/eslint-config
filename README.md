# eslint-config-exp

[![Test application](https://github.com/BonnierNews/eslint-config-exp/actions/workflows/run-tests.yml/badge.svg?branch=master)](https://github.com/BonnierNews/eslint-config-exp/actions/workflows/run-tests.yml)

Basic [ESLint](https://eslint.org/) rules used by [Expressen](https://www.expressen.se). The test-config (`eslint-config-exp/test`) is adapted to
testing using `mocha`, `mocha-cakes-2` and `chai`.

## Usage

Install `eslint` and `eslint-config-exp`:

```bash
npm install --save-dev eslint eslint-config-exp
```

For CommonJS modules, add the following to your `.eslintrc.json`-file:

```json
{
  "root": true,
  "extends": [ "eslint-config-exp" ]
}
```

If you are using ES6 modules, instead add this to the `.eslintrc.json`-file:

```json
{
  "root": true,
  "extends": [ "eslint-config-exp/modules" ]
}
```

Add the following to your `test/.eslintrc.json`-file:

```json
{
  "extends": [ "eslint-config-exp/test" ]
}
```

The test config only contain test related configuration. It is assumed that the project has a root configuration
defined (as described above) in a parent folder relative to the test configuration.

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
- Remove any globals and special rules related to `mocha-cakes-2` in your `test/.eslintrc.json`, they already exist
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
