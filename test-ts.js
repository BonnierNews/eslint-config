"use strict";

const tsConfigPromise = require("./ts");
const testBase = require("./test-base");

module.exports = (async () => {
  const tsConfig = await tsConfigPromise;

  return {
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
})();
