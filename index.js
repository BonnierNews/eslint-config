"use strict";

const { baseRules } = require("./rules");

module.exports = {
  ignorePatterns: [
    "tmp/",
    "public/",
    "submodule/**",
    "logs/",
    "docs/",
  ],
  parserOptions: { ecmaVersion: 2021 },
  env: {
    node: true,
    es6: true,
  },
  plugins: [ "eslint-plugin-node" ],
  rules: baseRules,
};
