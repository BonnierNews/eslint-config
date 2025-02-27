"use strict";

const baseConfig = require("./base-config");
const typescriptRules = require("./typescript-rules");
const typeScriptPlugin = require("@typescript-eslint/eslint-plugin");
const typeScriptParser = require("@typescript-eslint/parser");
const stylistic = require("@stylistic/eslint-plugin");
const bnTypescriptRules = require("@bonniernews/eslint-plugin-typescript-rules");

const typescriptBase = {
  plugins: {
    ...baseConfig.plugins,
    "@typescript-eslint": typeScriptPlugin,
    "@stylistic": stylistic,
    "@bonniernews/typescript-rules": bnTypescriptRules,
  },
  languageOptions: {
    sourceType: "module",
    parser: typeScriptParser,
  },
  files: [ "**/*.ts" ],
  rules: { ...baseConfig.rules, ...typescriptRules },
  settings: { "import/resolver": { node: { extensions: [ ".ts", ".js" ] } } },
};

module.exports = typescriptBase;
