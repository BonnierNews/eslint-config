"use strict";

const baseConfig = require(".");

const typescriptEslintRecommended = {
  "@typescript-eslint/adjacent-overload-signatures": "error",
  "@typescript-eslint/ban-ts-comment": "error",
  "@typescript-eslint/ban-types": "error",
  "no-array-constructor": "off",
  "@typescript-eslint/no-array-constructor": "error",
  "no-empty-function": "off",
  "@typescript-eslint/no-empty-function": "error",
  "@typescript-eslint/no-empty-interface": "error",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-extra-non-null-assertion": "error",
  "no-extra-semi": "off",
  "@typescript-eslint/no-extra-semi": "error",
  "@typescript-eslint/no-inferrable-types": "error",
  "no-loss-of-precision": "off",
  "@typescript-eslint/no-loss-of-precision": "error",
  "@typescript-eslint/no-misused-new": "error",
  "@typescript-eslint/no-namespace": "error",
  "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-this-alias": "error",
  "@typescript-eslint/no-unnecessary-type-constraint": "error",
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": "warn",
  "@typescript-eslint/no-var-requires": "error",
  "@typescript-eslint/prefer-as-const": "error",
  "@typescript-eslint/prefer-namespace-keyword": "error",
  "@typescript-eslint/triple-slash-reference": "error",
};

const disallowNonEcmaScriptCompatibleSyntax = {
  "no-restricted-syntax": [
    "error",
    {
      selector: "ClassDeclaration[abstract]",
      message: "Abstract classes aren't allowed.",
    },
    {
      selector: "PropertyDefinition[accessibility=private]",
      message: "Private keyword isn't allowed, use native # instead.",
    },
    {
      selector: "MethodDefinition[decorators]",
      message: "Decorators aren't allowed.",
    },
    {
      selector: "TSEnumDeclaration",
      message: "Don't use enums since it is not a type-level extension of JavaScript. Use Objects instead.",
    },
    {
      selector: "ClassDeclaration[superClass]",
      message: "Extending other classes via inheritance isn't allowed. Use composition instead.",
    },
  ],
};

const eslitRecommendedTs = {
  "constructor-super": "off", // ts(2335) & ts(2377)
  "getter-return": "off", // ts(2378)
  "no-const-assign": "off", // ts(2588)
  "no-dupe-args": "off", // ts(2300)
  "no-dupe-class-members": "off", // ts(2393) & ts(2300)
  "no-dupe-keys": "off", // ts(1117)
  "no-func-assign": "off", // ts(2539)
  "no-import-assign": "off", // ts(2539) & ts(2540)
  "no-new-symbol": "off", // ts(7009)
  "no-obj-calls": "off", // ts(2349)
  "no-redeclare": "off", // ts(2451)
  "no-setter-return": "off", // ts(2408)
  "no-this-before-super": "off", // ts(2376)
  "no-undef": "off", // ts(2304)
  "no-unreachable": "off", // ts(7027)
  "no-unsafe-negation": "off", // ts(2365) & ts(2360) & ts(2358)
  "no-var": "error", // ts transpiles let/const to var, so no need for vars any more
  "prefer-const": "error", // ts provides better types with const
  "prefer-rest-params": "error", // ts provides better types with rest args over arguments
  "prefer-spread": "error", // ts transpiles spread to apply, so no need for manual apply
  "valid-typeof": "off", // ts(2367)
};

module.exports = {
  ...baseConfig,
  overrides: [
    {
      parser: "@typescript-eslint/parser",
      parserOptions: { sourceType: "module" },
      settings: { "import/resolver": { node: { extensions: [ ".ts", ".js" ] } } },
      plugins: [
        "@typescript-eslint",
      ],
      files: [ "*.ts" ],
      rules: {
        ...typescriptEslintRecommended,
        ...disallowNonEcmaScriptCompatibleSyntax,
        ...eslitRecommendedTs,
      },
    },
  ],
};
