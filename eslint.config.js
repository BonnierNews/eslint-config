import config from "./index.js";

export default [
  { ignores: [ "test/data/**/*", "test/helpers/**/*", "test/commonjs/**/*" ] },
  ...config,
  {
    // The scenarios that exercise the safety rules have to spell out what those rules look for:
    // production looking database hosts and credentials. Here they are strings handed to the linter
    // as input, not configuration this repository uses, so the two rules that read string contents
    // are off for this file only.
    files: [ "test/feature/lint-safety-feature.js" ],
    rules: {
      "bn-safety/no-remote-db-target": "off",
      "bn-safety/no-credentials-in-source": "off",
    },
  },
];
