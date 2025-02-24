"use strict";

const baseConfig = require("./base-config");
const testBase = require("./test-base");

module.exports = {
  ...baseConfig,
  ...testBase,
  rules: {
    ...baseConfig.rules,
    ...testBase.rules,
  },
  plugins: {
    ...baseConfig.plugins,
    ...testBase.plugins,
  },
  files: [ "**/test/**/*.js" ],
};
