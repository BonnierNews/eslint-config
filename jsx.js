import reactPlugin from "eslint-plugin-react";

import baseConfig from "./base-config.js";
import reactRules from "./react-rules.js";

export default {
  ...baseConfig,
  files: [ "**/*.jsx" ],
  languageOptions: {
    ...baseConfig.languageOptions,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: { ...baseConfig.plugins, react: reactPlugin },
  rules: { ...baseConfig.rules, ...reactRules },
};
