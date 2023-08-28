"use strict";

const baseConfig = require(".");
const reactRules = require("./react-rules");

module.exports = {
  ...baseConfig,
  overrides: [
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
