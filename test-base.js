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
    // keep tests away from production data, see safety-plugin.js. Warnings for now, errors in the
    // next major version.
    "bn-safety/require-test-guards": "warn",
    "bn-safety/gitignore-env": "warn",
    "bn-safety/env-pin-must-not-import": "warn",
    "bn-safety/no-remote-db-target": "warn",
    "bn-safety/no-widened-nock": "warn",
  },
};
