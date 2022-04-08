"use strict";

const baseConfig = require(".");
const testConfig = require("./test");

module.exports = {
  ...baseConfig,
  overrides: [
    {
      files: [ "**/test?(s)/**/*" ],
      ...testConfig,
    },
  ],
};
