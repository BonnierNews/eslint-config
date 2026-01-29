import chaiFriendly from "eslint-plugin-chai-friendly";
import noOnlyTests from "eslint-plugin-no-only-tests";

import globals from "./globals.js";

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

export default {
  languageOptions: { globals: { ...mochaCakes2Globals } },
  files: [ "**/test/**/*.js", "**/test/**/*.ts" ],
  plugins: {
    "no-only-tests": noOnlyTests,
    "chai-friendly": chaiFriendly,
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
  },
};
