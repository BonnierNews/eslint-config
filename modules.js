"use strict";

const { baseRules, importRules } = require("./rules");

module.exports = {
  ignorePatterns: [
    "tmp/",
    "public/",
    "submodule/**",
    "logs/",
    "docs/",
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: {
    es2022: true,
    node: true,
  },
  plugins: [ "eslint-plugin-node", "import" ],
  rules: { ...baseRules, ...importRules },
};
