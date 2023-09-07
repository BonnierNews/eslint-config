"use strict";

const baseConfig = require(".");
const typescriptRules = require("./typescript-rules");
const reactRules = require("./react-rules");
const settings = { "import/resolver": { node: { extensions: [ ".ts", ".js", ".tsx", ".jsx" ] } } };

module.exports = {
  ...baseConfig,
  overrides: [
    {
      parser: "@typescript-eslint/parser",
      parserOptions: { sourceType: "module", ecmaFeatures: { jsx: true } },
      plugins: [
        "react",
        "@typescript-eslint",
      ],
      settings,
      files: [ "*.tsx" ],
      rules: {
        ...typescriptRules,
        ...reactRules,
      },
    },
    {
      parser: "@typescript-eslint/parser",
      parserOptions: { sourceType: "module" },
      settings,
      plugins: [
        "@typescript-eslint",
      ],
      files: [ "*.ts" ],
      rules: typescriptRules,
    },
    {
      plugins: [
        "react",
      ],
      settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      files: [ "*.jsx" ],
      rules: reactRules,
    },
  ],
};
