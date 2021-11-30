"use strict";

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
};

const mochaCakes2Rules = { "new-cap": [
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
] };

const { env, rules, parserOptions } = require(".");

module.exports = {
  parserOptions,
  rules: {
    ...rules,
    // no only in tests
    "no-only-tests/no-only-tests": [
      "error",
      { block: [ "Feature", "Scenario", "it", "Describe" ] },
    ],
    ...mochaCakes2Rules,
    // chai friendly
    "no-unused-expressions": 0,
    "chai-friendly/no-unused-expressions": 2,
  },
  plugins: [
    "no-only-tests",
    "chai-friendly",
  ],
  globals: { ...mochaCakes2Globals },
  env: {
    ...env,
    mocha: true,
  },
};
