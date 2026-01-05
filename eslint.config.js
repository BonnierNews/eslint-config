"use strict";

const configPromise = require("./index.js");

module.exports = (async () => {
  const config = await configPromise;
  return [
    { ignores: [ "test/data/**/*", "test/helpers/**/*" ] },
    ...config,
  ];
})();
