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
    When("we lint two valid jsx files", async () => {
      results = await eslint.lintFiles([ "test/data/jsx/noerrors.jsx", "test/data/jsx/preact-module.jsx" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(2);
    });

    And("the lint result should have no messages", () => {
      expect(results[0].messages.length).to.eql(0, JSON.stringify(results[0].messages, null, 2));
      expect(results[1].messages.length).to.eql(0, JSON.stringify(results[0].messages, null, 2));
    });
  });

  Scenario("jsx file not passing, invalid curly braces", () => {
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

    let result;
    When("we lint a jsx file", async () => {
      const results = await eslint.lintFiles([ "test/data/jsx/curly-braces.jsx" ]);
      result = results[0];
    });

    Then("the lint result should have eight messages", () => {
      expect(result.messages.length).to.eql(8, JSON.stringify(result.messages, null, 2));
    });

    And("three errors should be 'A space is required before'", () => {
      const errors = result.messages.filter(({ message }) => message.includes("A space is required before"));
      expect(errors.length).to.eql(3);
    });

    And("three errors should be 'A space is required after'", () => {
      const errors = result.messages.filter(({ message }) => message.includes("A space is required after"));
      expect(errors.length).to.eql(3);
    });

    And("two errors should be 'There should be no space before'", () => {
      const errors = result.messages.filter(({ message }) => message.includes("There should be no space before"));
      expect(errors.length).to.eql(1);
    });

    And("one error should be 'There should be no space after'", () => {
      const errors = result.messages.filter(({ message }) => message.includes("There should be no space after"));
      expect(errors.length).to.eql(1);
    });
  });
});
