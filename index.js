"use strict";

const baseConfig = require("./base-config");
const jsxConfig = require("./jsx");
const tsConfigPromise = require("./ts");
const tsxConfigPromise = require("./tsx");
const testJsConfig = require("./test-js");
const testTsConfigPromise = require("./test-ts");
const ignoresConfig = require("./ignores");

module.exports = (async () => {
  const tsConfig = await tsConfigPromise;
  const tsxConfig = await tsxConfigPromise;
  const testTsConfig = await testTsConfigPromise;

  return [
    baseConfig,
    jsxConfig,
    tsConfig,
    tsxConfig,
    testJsConfig,
    testTsConfig,
    ignoresConfig,
  ];
})();
