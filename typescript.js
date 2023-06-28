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
      selector: "TSModuleDeclaration[kind=namespace]",
      message: "Don't use namespace, use ESM modules instead.",
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

module.exports = {
  ...baseConfig,
  overrides: [
    {
      parser: "@typescript-eslint/parser",
      parserOptions: { sourceType: "module" },
      plugins: [
        "@typescript-eslint",
      ],
      files: [ "*.ts" ],
      rules: { ...typescriptEslintRecommended, ...disallowNonEcmaScriptCompatibleSyntax },
    },
  ],
};
