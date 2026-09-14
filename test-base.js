import chaiFriendly from "eslint-plugin-chai-friendly";
import noOnlyTests from "eslint-plugin-no-only-tests";

import globals from "./globals.js";
import safetyPlugin from "./safety-plugin.js";

const mochaCakes2Globals = {
  And: "readonly",
  But: "readonly",
  Feature: "readonly",
  Given: "readonly",
  Scenario: "readonly",
  Then: "readonly",
  When: "readonly",
  afterEachScenario: "readonly",
  beforeEachScenario: "readonly",
  afterEachFeature: "readonly",
  beforeEachFeature: "readonly",
  ...globals.mocha,
  ...globals.chai,
};

const mochaCakes2Rules = {
  "new-cap": [
    2,
    {
      capIsNewExceptions: [
        "Feature",
        "Scenario",
        "Given",
        "When",
        "Then",
        "And",
        "But",
        "I",
        "System",
        "Describe",
      ],
    },
  ],
};

// Where tests live. A directory named test is the convention in the node-starterapp template, but
// colocated *.test.js files and a spec directory are common enough that the safety rules would miss
// whole repos without them. Exported so the js and ts test configs stay in step.
export const testFilePatterns = (extension) => [
  `**/test/**/*.${extension}`,
  `**/tests/**/*.${extension}`,
  `**/spec/**/*.${extension}`,
  `**/__tests__/**/*.${extension}`,
  `**/*.test.${extension}`,
  `**/*.spec.${extension}`,
];

export default {
  languageOptions: { globals: { ...mochaCakes2Globals } },
  files: [ ...testFilePatterns("js"), ...testFilePatterns("ts") ],
  plugins: {
    "no-only-tests": noOnlyTests,
    "chai-friendly": chaiFriendly,
    "bn-safety": safetyPlugin,
  },
  rules: {
    ...mochaCakes2Rules,
    // no only in tests
    "no-only-tests/no-only-tests": [
      "error",
      { block: [ "Feature", "Scenario", "it", "Describe", "describe", "context" ] },
    ],
    // chai friendly
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2,
    // The bn-safety rules that only make sense for tests. The first two check the project rather
    // than the file and stay silent unless it depends on a data store. safety-plugin.js documents
    // all of them, with examples. Warnings for now, errors in the next major version.
    //
    //   require-test-guards        no network guard, or no environment pin, is loaded before the
    //                              tests run
    //   gitignore-env              no .gitignore up to the repository root excludes .env
    //   env-pin-must-not-import    the file that pins the environment also imports something
    //   no-remote-db-target        a database host off this machine, or TLS verification turned off
    //   no-widened-nock            nock told to allow every outbound http request
    "bn-safety/require-test-guards": "warn",
    "bn-safety/gitignore-env": "warn",
    "bn-safety/env-pin-must-not-import": "warn",
    "bn-safety/no-remote-db-target": "warn",
    "bn-safety/no-widened-nock": "warn",
  },
};
