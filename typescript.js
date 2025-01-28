"use strict";

const baseConfig = require(".");
const typescriptRules = require("./typescript-rules");
const typeScriptPlugin = require("@typescript-eslint/eslint-plugin");
const typeScriptParser = require("@typescript-eslint/parser");
const stylistic = require("@stylistic/eslint-plugin");
const bnTypescriptRules = require("@bonniernews/eslint-plugin-typescript-rules");
const reactPlugin = require("eslint-plugin-react");
const reactRules = require("./react-rules");

const typescriptBase = {
  plugins: {
    "@typescript-eslint": typeScriptPlugin,
    "@stylistic": stylistic,
    "@bonniernews/typescript-rules": bnTypescriptRules,
  },
  languageOptions: {
    sourceType: "module",
    parser: typeScriptParser,
  },
  files: [ "**/*.ts" ],
  rules: typescriptRules,
  settings: { "import/resolver": { node: { extensions: [ ".ts", ".js" ] } } },
};

module.exports = [
  ...baseConfig,
  typescriptBase,
  {
    ...typescriptBase,
    plugins: { ...typescriptBase.plugins, react: reactPlugin },
    files: [ "**/*.tsx" ],
    settings: { "import/resolver": { node: { extensions: [ ".ts", ".js", ".tsx", ".jsx" ] } } },
    rules: { ...typescriptBase.rules, ...reactRules },
  },
];
