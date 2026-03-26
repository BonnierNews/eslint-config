import config from "./index.js";

export default [
  { ignores: [ "test/data/**/*", "test/helpers/**/*", "test/commonjs/**/*" ] },
  ...config,
];
