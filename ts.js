"use strict";

const baseConfig = require("./base-config");
const typescriptRules = require("./typescript-rules");
const typeScriptPlugin = require("@typescript-eslint/eslint-plugin");
const typeScriptParser = require("@typescript-eslint/parser");
const bnTypescriptRules = require("@bonniernews/eslint-plugin-typescript-rules");

module.exports = (async () => {
  const stylistic = await import("@stylistic/eslint-plugin");

  const typescriptBase = {
    plugins: {
      ...baseConfig.plugins,
      "@typescript-eslint": typeScriptPlugin,
      "@stylistic": stylistic.default,
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

  return typescriptBase;
})();
