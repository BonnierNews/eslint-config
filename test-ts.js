import testBase, { testFilePatterns } from "./test-base.js";
import tsConfig from "./ts.js";

export default {
  ...tsConfig,
  ...testBase,
  languageOptions: {
    ...tsConfig.languageOptions,
    ...testBase.languageOptions,
  },
  rules: {
    ...tsConfig.rules,
    ...testBase.rules,
  },
  plugins: {
    ...tsConfig.plugins,
    ...testBase.plugins,
  },
  files: testFilePatterns("ts"),
};
