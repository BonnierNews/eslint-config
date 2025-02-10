"use strict";

const noOnlyTests = require("eslint-plugin-no-only-tests");
const chaiFriendly = require("eslint-plugin-chai-friendly");

const mochaCakes2Globals = {
  And: "readonly",
  But: "readonly",
  Feature: "readonly",
  Given: "readonly",
  Scenario: "readonly",
  Then: "readonly",
  When: "readonly",
  should: "readonly",
  expect: "readonly",
  afterEachScenario: "readonly",
  beforeEachScenario: "readonly",
  afterEachFeature: "readonly",
  beforeEachFeature: "readonly",
  it: "readonly",
  describe: "readonly",
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

module.exports = {
  languageOptions: { globals: { ...mochaCakes2Globals } },
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
