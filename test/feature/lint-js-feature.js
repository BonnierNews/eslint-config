"use strict";

const { ESLint } = require("eslint");
const getRules = require("../../rules");

const hasES2022Support = parseInt(process.versions.node.split(".").shift(), 10) >= 16;

Feature("linting js files", () => {
  Scenario("js file passing lint rules", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfig: {
          ignorePatterns: [
            "tmp/",
            "public/",
            "submodule/**",
            "logs/",
            "docs/",
          ],
          parserOptions: {
            ecmaVersion: hasES2022Support ? 2022 : 2021,
            sourceType: "module",
          },
          env: {
            node: true,
            ...(hasES2022Support ? { es2022: true } : { es6: true }),
          },
          plugins: [ "eslint-plugin-n", "import", "@bonniernews/typescript-rules" ],
          rules: getRules(true),
        },
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a file that should pass", async () => {
      results = await eslint.lintFiles([ "test/data/js/noerrors.js" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have no messages", () => {
      expect(results[0].messages.length).to.eql(0);
    });
  });

  Scenario("js file does not pass, tries to extend class", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfigFile: "index.js",
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a file which extends a class", async () => {
      results = await eslint.lintFiles([ "test/data/js/extends.js" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have errors", () => {
      expect(results[0].messages.length).to.be.eql(1);
    });

    And("one error should be because it extends a class", () => {
      const error = results[0].messages.find(({ ruleId }) => ruleId === "@bonniernews/typescript-rules/disallow-class-extends");
      expect(error).to.not.be.undefined;
      expect(error.message).to.have.string("Extending");
    });
  });

  Scenario("js file does not pass, due to bad import order", () => {
    let eslint;
    Given("we have an eslint instance with the base config", () => {
      eslint = new ESLint({
        overrideConfig: {
          ignorePatterns: [
            "tmp/",
            "public/",
            "submodule/**",
            "logs/",
            "docs/",
          ],
          parserOptions: {
            ecmaVersion: hasES2022Support ? 2022 : 2021,
            sourceType: "module",
          },
          env: {
            node: true,
            ...(hasES2022Support ? { es2022: true } : { es6: true }),
          },
          plugins: [ "eslint-plugin-n", "import", "@bonniernews/typescript-rules" ],
          rules: getRules(true),
        },
        useEslintrc: false,
        ignore: false,
      });
    });

    let results;
    When("we lint a file that should pass", async () => {
      results = await eslint.lintFiles([ "test/data/js/import.js" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("the file should have six messages", () => {
      expect(results[0].messages.length).to.eql(6);
    });
  });
});
