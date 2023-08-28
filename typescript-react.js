"use strict";

const baseConfig = require(".");
const typescriptRules = require("./typescript-rules");
const reactRules = require("./react-rules");

module.exports = {
  ...baseConfig,
  overrides: [
    {
      parser: "@typescript-eslint/parser",
      parserOptions: { sourceType: "module", ecmaFeatures: { jsx: true } },
      settings: { "import/resolver": { node: { extensions: [ ".ts", ".js" ] } } },
      plugins: [
        "react",
        "@typescript-eslint",
      ],
      files: [ "*.tsx" ],
      rules: {
        ...typescriptRules,
        ...reactRules,
      },
    },
    {
      plugins: [
        "react",
      ],
      parserOptions: { ecmaFeatures: { jsx: true } },
      files: [ "*.jsx" ],
      rules: reactRules,
    },
  ],
};
