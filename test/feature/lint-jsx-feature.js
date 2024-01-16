"use strict";

const { ESLint } = require("eslint");

Feature("linting jsx files", () => {
  Scenario("jsx file passing lint rules", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "react.js",
        overrideConfig: {
          parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
          },
          settings: {
            react: {
              pragma: "Preact",
              version: "16.0",
            },
          },
        },
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a folder", async () => {
      results = await eslint.lintFiles([ "test/data/jsx/*.jsx" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have no messages", () => {
      expect(results[0].messages.length).to.eql(0, JSON.stringify(results[0].messages, null, 2));
    });
  });
});
