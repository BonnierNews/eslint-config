"use strict";

const baseConfig = require(".");
const typescriptRules = require("./typescript-rules");

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
      rules: typescriptRules,
    },
  ],
};
