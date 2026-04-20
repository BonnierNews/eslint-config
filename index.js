"use strict";

const jsConfig = require("./js");
const jsxConfig = require("./jsx");
const tsConfig = require("./ts");
const tsxConfig = require("./tsx");
const testJsConfig = require("./test-js");
const testTsConfig = require("./test-ts");
const ignoresConfig = require("./ignores");

module.exports = [
  jsConfig,
  jsxConfig,
  tsConfig,
  tsxConfig,
  testJsConfig,
  testTsConfig,
  ignoresConfig,
];
