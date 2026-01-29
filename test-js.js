import baseConfig from "./base-config.js";
import testBase from "./test-base.js";

export default {
  ...baseConfig,
  ...testBase,
  rules: {
    ...baseConfig.rules,
    ...testBase.rules,
  },
  plugins: {
    ...baseConfig.plugins,
    ...testBase.plugins,
  },
  files: [ "**/test/**/*.js" ],
};
