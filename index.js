"use strict";

const path = require("path");
const fs = require("fs");
const getRules = require("./rules");

// This will take care of potential symlinks
const appDir = fs.realpathSync(process.cwd());

const isModuleProject = require(path.resolve(appDir, "package.json")).type === "module";
const hasES2022Support = parseInt(process.versions.node.split(".").shift(), 10) >= 16;

const moduleConfig = {
  parserOptions: {
    ecmaVersion: hasES2022Support ? 2022 : 2021,
    sourceType: "module",
  },
  env: {
    node: true,
    ...(hasES2022Support ? { es2022: true } : { es6: true }),
  },
  plugins: [ "eslint-plugin-n", "import", "@bonniernews/typescript-rules" ],
};

const commonjsConfig = {
  parserOptions: { ecmaVersion: 2021 },
  env: {
    node: true,
    es6: true,
  },
  plugins: [ "eslint-plugin-n", "@bonniernews/typescript-rules" ],
};

module.exports = {
  ignorePatterns: [
    "tmp/",
    "public/",
    "submodule/**",
    "logs/",
    "docs/",
  ],
  ...(isModuleProject ? moduleConfig : commonjsConfig),
  rules: getRules(isModuleProject),
};
