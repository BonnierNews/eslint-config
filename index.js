"use strict";

const baseConfig = require("./base-config");
const jsxConfig = require("./jsx");
const tsConfig = require("./ts");
const tsxConfig = require("./tsx");
const testConfig = require("./test");
const ignoresConfig = require("./ignores");

module.exports = [
  baseConfig,
  jsxConfig,
  tsConfig,
  tsxConfig,
  testConfig,
  ignoresConfig,
];
