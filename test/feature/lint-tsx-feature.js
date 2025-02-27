"use strict";

const { ESLint } = require("eslint");

Feature("linting tsx files", () => {
  Scenario("tsx file passing lint rules", () => {
    let eslint;
    Given("we have an eslint instance with the react config", () => {
      eslint = new ESLint({
        overrideConfigFile: "tsx.js",
        overrideConfig: {
          settings: {
            react: {
              pragma: "Preact",
              version: "16.0",
            },
          },
        },
        ignore: false,
      });
    });

    let results;
    When("we lint a file", async () => {
      results = await eslint.lintFiles([ "test/data/tsx/noerrors.tsx" ]);
    });

    Then("we should have linted the correct number of files", () => {
      expect(results.length).to.eql(1);
    });

    And("one file should have no messages", () => {
      expect(results[0].messages.length).to.eql(0, JSON.stringify(results[0].messages, null, 2));
    });
  });
});
