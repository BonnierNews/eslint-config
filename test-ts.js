"use strict";

const tsConfig = require("./ts");
const testBase = require("./test-base");

module.exports = {
  ...tsConfig,
  ...testBase,
  languageOptions: {
    ...tsConfig.languageOptions,
    ...testBase.languageOptions,
  },
  rules: {
    ...tsConfig.rules,
    ...testBase.rules,
  },
  plugins: {
    ...tsConfig.plugins,
    ...testBase.plugins,
  },
  files: [ "**/test/**/*.ts" ],
};
