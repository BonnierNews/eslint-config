import bnTypescriptRules from "@bonniernews/eslint-plugin-typescript-rules";
import stylistic from "@stylistic/eslint-plugin";
import typeScriptPlugin from "@typescript-eslint/eslint-plugin";
import typeScriptParser from "@typescript-eslint/parser";

import baseConfig from "./base-config.js";
import typescriptRules from "./typescript-rules.js";

const typescriptBase = {
  plugins: {
    ...baseConfig.plugins,
    "@typescript-eslint": typeScriptPlugin,
    "@stylistic": stylistic,
    "@bonniernews/typescript-rules": bnTypescriptRules,
  },
  languageOptions: {
    sourceType: "module",
    parser: typeScriptParser,
  },
  files: [ "**/*.ts" ],
  rules: { ...baseConfig.rules, ...typescriptRules },
  settings: { "import/resolver": { node: { extensions: [ ".ts", ".js" ] } } },
};

export default typescriptBase;
