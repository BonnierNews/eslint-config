import reactPlugin from "eslint-plugin-react";

import reactRules from "./react-rules.js";
import typescriptBase from "./ts.js";

export default {
  ...typescriptBase,
  plugins: { ...typescriptBase.plugins, react: reactPlugin },
  files: [ "**/*.tsx" ],
  rules: { ...typescriptBase.rules, ...reactRules },
  settings: { "import/resolver": { node: { extensions: [ ".ts", ".js", ".tsx", ".jsx" ] } } },
};
