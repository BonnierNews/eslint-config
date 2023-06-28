"use strict";

const { ESLint } = require("eslint");

Feature("linting ts files", () => {
  Scenario("ts file passing lint rules", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "typescript.js",
        useEslintrc: false,
      });
    });

    let results;
    When("we lint a file", async () => {
      results = await eslint.lintFiles([ "test/data/typescript/noerrors.ts" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have no messages", () => {
      expect(results[0].messages.length).to.eql(0);
    });
  });

  Scenario("ts file does not pass, uses enum", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "typescript.js",
        useEslintrc: false,
      });
    });

    let results;
    When("we lint a file using enums", async () => {
      results = await eslint.lintFiles([ "test/data/typescript/enum.ts" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have errors", () => {
      expect(results[0].messages.length).to.be.gt(1);
    });

    And("one error should be because it has enum", () => {
      const error = results[0].messages.find(({ ruleId }) => ruleId === "no-restricted-syntax");
      expect(error).to.not.be.undefined;
      expect(error.message).to.have.string("enum");
    });

  });
});
