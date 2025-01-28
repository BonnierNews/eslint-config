"use strict";

const reactPlugin = require("eslint-plugin-react");
const reactRules = require("./react-rules");
const baseConfig = require("./base-config");
const testConfig = require("./test");

module.exports = [
  baseConfig,
  {
    ...baseConfig,
    files: [ "**/*.jsx" ],
    languageOptions: {
      ...baseConfig.languageOptions,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { ...baseConfig.plugins, react: reactPlugin },
    rules: { ...baseConfig.rules, ...reactRules },
  },
  {
    ...baseConfig,
    languageOptions: { ...baseConfig.languageOptions, ...testConfig.languageOptions },
    plugins: { ...baseConfig.plugins, ...testConfig.plugins },
    rules: { ...baseConfig.rules, ...testConfig.rules },
    files: [ "test/**/*.js" ],
  },
];
