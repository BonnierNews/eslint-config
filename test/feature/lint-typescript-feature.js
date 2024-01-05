"use strict";

const { ESLint } = require("eslint");

Feature("linting ts files", () => {
  Scenario("ts file passing lint rules", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "typescript.js",
        useEslintrc: false,
        ignore: false,
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
        ignore: false,
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
      const error = results[0].messages.find(({ ruleId }) => ruleId === "typescript-rules/disallow-non-es-compatible");
      expect(error).to.not.be.undefined;
      expect(error.message).to.have.string("enum");
    });

  });

  Scenario("ts file does not pass, uses abstract class", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "typescript.js",
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a file using an abstract class", async () => {
      results = await eslint.lintFiles([ "test/data/typescript/abstract.ts" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have errors", () => {
      expect(results[0].messages.length).to.be.eql(1);
    });

    And("one error should be because it has an abstract class", () => {
      const error = results[0].messages[0];
      expect(error.ruleId).to.equal("typescript-rules/disallow-abstract-class");
      expect(error.message).to.have.string("Abstract classes");
    });

  });

  Scenario("ts file does not pass, uses private property", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "typescript.js",
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a file using a private property", async () => {
      results = await eslint.lintFiles([ "test/data/typescript/private.ts" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have errors", () => {
      expect(results[0].messages.length).to.be.eql(1);
    });

    And("one error should be because it has a private property", () => {
      const error = results[0].messages.find(({ ruleId }) => ruleId === "typescript-rules/disallow-non-es-compatible");
      expect(error).to.not.be.undefined;
      expect(error.message).to.have.string("Private");
    });

  });

  Scenario("ts file does not pass, tries to extend class", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "typescript.js",
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a file which extends a class", async () => {
      results = await eslint.lintFiles([ "test/data/typescript/extends.ts" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have errors", () => {
      expect(results[0].messages.length).to.be.eql(1);
    });

    And("one error should be because it extends a class", () => {
      const error = results[0].messages.find(({ ruleId }) => ruleId === "typescript-rules/disallow-class-extends");
      expect(error).to.not.be.undefined;
      expect(error.message).to.have.string("Extending");
    });

  });

  Scenario("ts file does not pass, since it use decorators", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "typescript.js",
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a file which uses decorators", async () => {
      results = await eslint.lintFiles([ "test/data/typescript/decorators.ts" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have errors", () => {
      expect(results[0].messages.length).to.be.eql(1);
    });

    And("one error should be because it extends a class", () => {
      const error = results[0].messages.find(({ ruleId }) => ruleId === "typescript-rules/disallow-non-es-compatible");
      expect(error).to.not.be.undefined;
      expect(error.message).to.have.string("Decorators");
    });

  });
});
