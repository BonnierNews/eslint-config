"use strict";

const path = require("path");
const fs = require("fs");
const getRules = require("./rules");
const globals = require("./globals");

const eslintPluginN = require("eslint-plugin-n");
const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginTypescriptRules = require("@bonniernews/eslint-plugin-typescript-rules");

// This will take care of potential symlinks
const appDir = fs.realpathSync(process.cwd());

const isModuleProject = require(path.resolve(appDir, "package.json")).type === "module";
const hasES2022Support = parseInt(process.versions.node.split(".").shift(), 10) >= 16;

const moduleConfig = {
  languageOptions: {
    ecmaVersion: hasES2022Support ? 2022 : 2021,
    globals: { ...globals.node },
    sourceType: "module",
  },
  plugins: {
    n: eslintPluginN,
    import: eslintPluginImport,
    "@bonniernews/typescript-rules": eslintPluginTypescriptRules,
  },
};

const commonjsConfig = {
  languageOptions: {
    ecmaVersion: 2021,
    sourceType: "commonjs",
    globals: { ...globals.node },
  },
  plugins: {
    n: eslintPluginN,
    "@bonniernews/typescript-rules": eslintPluginTypescriptRules,
  },
};

const baseConfig = {
  ...(isModuleProject ? moduleConfig : commonjsConfig),
  rules: getRules(isModuleProject),
};

module.exports = baseConfig;
