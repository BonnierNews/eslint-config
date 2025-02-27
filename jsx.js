"use strict";

const reactPlugin = require("eslint-plugin-react");
const reactRules = require("./react-rules");
const baseConfig = require("./base-config");

module.exports = {
  ...baseConfig,
  files: [ "**/*.jsx" ],
  languageOptions: {
    ...baseConfig.languageOptions,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: { ...baseConfig.plugins, react: reactPlugin },
  rules: { ...baseConfig.rules, ...reactRules },
};
