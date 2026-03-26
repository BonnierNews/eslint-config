import eslintPluginTypescriptRules from "@bonniernews/eslint-plugin-typescript-rules";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginN from "eslint-plugin-n";
import fs from "fs";
import { createRequire } from "module";
import path from "path";

import globals from "./globals.js";
import getRules from "./rules.js";

const require = createRequire(import.meta.url);

function findPackageJson() {
  let dir = process.cwd();
  const root = path.parse(dir).root;

  while (dir !== root) {
    const pkgfile = path.join(dir, "package.json");

    if (fs.existsSync(pkgfile)) {
      return pkgfile;
    }

    if (fs.existsSync(path.join(dir, ".git"))) {
      break;
    }

    dir = path.join(dir, "..");
  }

  return null;
}

// eslint-disable-next-line import/no-dynamic-require
const isModuleProject = require(findPackageJson()).type === "module";
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

export default baseConfig;
