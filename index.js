"use strict";

const baseConfig = require("./base-config");
const jsxConfig = require("./jsx");
const tsConfig = require("./ts");
const tsxConfig = require("./tsx");
const testConfig = require("./test");

module.exports = [
  baseConfig,
  jsxConfig,
  tsConfig,
  tsxConfig,
  testConfig,
  {
    ignores: [
      "tmp/",
      "public/",
      "submodule/**",
      "logs/",
      "docs/",
      "**/.terraform/",
    ],
  },
];
