import { ESLint } from "eslint";
import fs from "fs";
import os from "os";
import path from "path";

// Two kinds of scenario live here.
//
// The rules that only look at code are exercised against the fixtures in test/data/safety/content,
// a fixture project with no database dependency so that the project level rules stay quiet there.
//
// The two project level rules read a project's mocha config and .gitignore off disk, walking up to
// the repository root. Fixtures committed inside this repository would inherit this repository's own
// mocharc and .gitignore, so those scenarios build a throwaway project in a temporary directory
// instead. That also lets them cover a project with no mocha config at all.
const contentFixtures = "test/data/safety/content";
const testConfig = path.resolve("test-js.js");
const sourceConfig = path.resolve("js.js");

// Every reported problem carries the id of the message its rule used, which is what these scenarios
// assert on. Comparing ids rather than message text keeps the wording free to improve.
function messageIds(result) {
  return result.messages
    .filter(({ ruleId }) => ruleId?.startsWith("bn-safety/"))
    .map(({ messageId }) => messageId);
}

async function lintFixture(configFile, file) {
  const eslint = new ESLint({ overrideConfigFile: configFile, ignore: false });
  const [ result ] = await eslint.lintFiles([ `${contentFixtures}/${file}` ]);

  return messageIds(result);
}

function lintAsTest(file) {
  return lintFixture(testConfig, file);
}

function lintAsSource(file) {
  return lintFixture(sourceConfig, file);
}

// Writes a project into a temporary directory and lints the files given, with the project as the
// working directory, which is where mocha would run. Returns the reported message ids per file.
async function lintProject(files, filesToLint = [ "test/probe.js" ]) {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "bn-safety-"));

  try {
    for (const [ file, contents ] of Object.entries(files)) {
      const target = path.join(projectDir, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, contents);
    }

    const eslint = new ESLint({ cwd: projectDir, overrideConfigFile: testConfig, ignore: false });
    const results = await eslint.lintFiles(filesToLint.map((file) => path.join(projectDir, file)));

    return results.map(messageIds);
  } finally {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
}

const probe = "export const answer = 42;\n";
const withDatabase = JSON.stringify({ name: "service", dependencies: { pg: "^8.16.3" } });
const pinFile = 'process.env.NODE_CONFIG_ENV = "test";\n';
const guardedMocharc = JSON.stringify({ require: [ "./test/helpers/env.js", "@bonniernews/stayput/register" ] });
const ignoresEnv = "node_modules\n.env\n";

Feature("detecting missing test guards in a project", () => {
  Scenario("a project with a database and no mocha config", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": withDatabase,
        ".gitignore": ignoresEnv,
        "test/probe.js": probe,
      });
    });

    Then("we are told there is no mocha config to load the guards from", () => {
      expect(reported).to.eql([ "noMochaConfig" ]);
    });
  });

  Scenario("a project whose mocha config loads neither guard", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": withDatabase,
        ".mocharc.json": JSON.stringify({ require: [ "./test/helpers/setup.js" ] }),
        ".gitignore": "node_modules\n",
        // Pinning NODE_ENV is not enough: exp-config prefers NODE_CONFIG_ENV over it.
        "test/helpers/setup.js": 'process.env.NODE_ENV = "test";\n',
        "test/probe.js": probe,
      });
    });

    Then("the missing network guard is reported", () => {
      expect(reported).to.include("missingGuard");
    });

    And("the missing environment pin is reported", () => {
      expect(reported).to.include("missingPin");
    });

    And("the unignored .env is reported", () => {
      expect(reported).to.include("notIgnored");
    });
  });

  Scenario("a project with both guards wired up", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": withDatabase,
        ".mocharc.json": guardedMocharc,
        ".gitignore": ignoresEnv,
        "test/helpers/env.js": pinFile,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("a project that anchors the guard in a setup file instead of the mocha config", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": withDatabase,
        ".mocharc.json": JSON.stringify({ require: [ "./test/helpers/env.js" ] }),
        ".gitignore": ignoresEnv,
        // stayput documents this as runner-proofing, so it has to count as loading the guard.
        "test/helpers/env.js": `import "@bonniernews/stayput/register";\n${pinFile}`,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("a mocha config written the way mocha allows rather than the way we expect", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": withDatabase,
        // A bare relative path, which mocha resolves; a directory, which mocha can require; and a
        // spec glob, which is not a require at all. A directory used to abort the whole lint run.
        ".mocharc.json": JSON.stringify({
          spec: "./test",
          require: [ "./test/helpers", "test/helpers/env.js", "@bonniernews/stayput/register" ],
        }),
        ".gitignore": ignoresEnv,
        "test/helpers/env.js": pinFile,
        "test/helpers/index.js": "export const helpers = {};\n",
        "test/probe.js": probe,
      });
    });

    Then("the guards are recognised and nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("a pin file that mentions the variable without pinning it", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": withDatabase,
        ".mocharc.json": guardedMocharc,
        ".gitignore": ignoresEnv,
        "test/helpers/env.js": [
          '// process.env.NODE_CONFIG_ENV = "test";',
          'if (process.env.NODE_CONFIG_ENV === "test") {',
          '  process.env.NODE_CONFIG_ENV = "production";',
          "}",
        ].join("\n"),
        "test/probe.js": probe,
      });
    });

    Then("the missing environment pin is reported", () => {
      expect(reported).to.eql([ "missingPin" ]);
    });
  });

  Scenario("a mocha config that lives in package.json", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        // Mocha merges the mocha key with the rc file rather than picking one, so both are read.
        "package.json": JSON.stringify({
          name: "service",
          dependencies: { pg: "^8.16.3" },
          mocha: { require: [ "./test/helpers/env.js", "@bonniernews/stayput/register" ] },
        }),
        ".mocharc.json": JSON.stringify({ reporter: "spec" }),
        // A wildcard pattern, which is how plenty of repos ignore .env and its variants.
        ".gitignore": "node_modules\n.env*\n",
        "test/helpers/env.js": pinFile,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("a workspace package guarded from the root of a monorepo", () => {
    let reported;
    When("we lint one of the workspace's test files", async () => {
      [ reported ] = await lintProject(
        {
          "package.json": JSON.stringify({ name: "root", private: true }),
          ".mocharc.json": guardedMocharc,
          // Git honours a pattern like this from the root, so it has to count here too.
          ".gitignore": "node_modules\n**/.env\n",
          "test/helpers/env.js": pinFile,
          "packages/orders/package.json": withDatabase,
          "packages/orders/test/probe.js": probe,
        },
        [ "packages/orders/test/probe.js" ]
      );
    });

    Then("nothing is reported, since the guards sit above the workspace", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("a project with no database dependency", () => {
    let reported;
    When("we lint a test file in a library whose mocha config loads no guards", async () => {
      [ reported ] = await lintProject({
        "package.json": JSON.stringify({ name: "library" }),
        ".mocharc.json": JSON.stringify({ reporter: "spec" }),
        ".gitignore": "node_modules\n",
        "test/probe.js": probe,
      });
    });

    Then("the project level rules stay silent, since there is nothing to guard", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("a project with more than one test file", () => {
    let reported;
    When("we lint three test files in the same unguarded project", async () => {
      const perFile = await lintProject(
        {
          "package.json": withDatabase,
          ".gitignore": ignoresEnv,
          "test/one.js": probe,
          "test/two.js": probe,
          "test/three.js": probe,
        },
        [ "test/one.js", "test/two.js", "test/three.js" ]
      );

      reported = perFile.flat();
    });

    // Which file carries the warning is whichever one the linter reached first, and that is not
    // guaranteed. What matters is that a project level fact is stated once for the project, rather
    // than repeated on every test file in it.
    Then("the project level fact is reported exactly once for the whole project", () => {
      expect(reported).to.eql([ "noMochaConfig" ]);
    });
  });
});

Feature("keeping test connections on this machine", () => {
  Scenario("a test file naming hosts outside this machine", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsTest("test/remote-targets.js");
    });

    Then("each remote database host is reported, in plain strings and in templates alike", () => {
      expect(reported.filter((id) => id === "remoteHost")).to.have.lengthOf(3);
    });

    And("both ways of turning off TLS verification are reported", () => {
      expect(reported.filter((id) => id === "tlsDisabled")).to.have.lengthOf(2);
    });
  });

  Scenario("a test file naming local hosts, container services and hosts read from config", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsTest("test/local-targets.js");
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });
});

Feature("protecting the environment pin", () => {
  Scenario("a pin file that also imports a module", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsTest("test/pin-with-imports.js");
    });

    Then("we are told the import runs before the pin", () => {
      expect(reported).to.eql([ "pinHasImports" ]);
    });
  });

  Scenario("a pin file that requires a module", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsTest("test/pin-with-require.js");
    });

    Then("a require is treated the same way as an import", () => {
      expect(reported).to.eql([ "pinHasImports" ]);
    });
  });

  Scenario("an import free pin file", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsTest("test/pinned-environment.js");
    });

    Then("nothing is reported, and setting the pin itself is not treated as tampering", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("code that opens the escape hatches", () => {
    let reported;
    When("we lint a file that widens the guard and re-enables config overrides", async () => {
      reported = await lintAsTest("test/escape-hatches.js");
    });

    Then("each guard variable is reported, however the environment is reached", () => {
      expect(reported.filter((id) => id === "guardVariable")).to.have.lengthOf(3);
    });

    And("widening the guard through its own api is reported", () => {
      expect(reported).to.include("guardOption");
    });

    And("enabling config overrides is reported", () => {
      expect(reported).to.include("overrideEnabled");
    });
  });
});

Feature("catching secrets written into source files", () => {
  Scenario("a file with real looking credentials", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsSource("credentials.js");
    });

    Then("the credentials in URIs are reported, in plain strings and in templates alike", () => {
      expect(reported.filter((id) => id === "credentialInUri")).to.have.lengthOf(3);
    });

    And("the private key is reported", () => {
      expect(reported).to.include("privateKey");
    });

    And("both the property and the class field holding a password are reported", () => {
      expect(reported.filter((id) => id === "hardcodedSecret")).to.have.lengthOf(2);
    });
  });

  Scenario("a file with local credentials, documentation examples, prose and short fixtures", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsSource("safe-credentials.js");
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });
});

Feature("keeping http mocking honest", () => {
  Scenario("a test file that re-enables all outbound http", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsTest("test/widened-nock.js");
    });

    Then("every call that allows any host is reported, and the real allow list is not", () => {
      expect(reported).to.eql([ "allConnectionsEnabled", "allConnectionsEnabled", "allConnectionsEnabled" ]);
    });
  });
});

Feature("keeping .env out of test processes", () => {
  Scenario("dotenv loaded with the override option, as a require", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsSource("dotenv-override.js");
    });

    Then("the override option is reported", () => {
      expect(reported).to.eql([ "overrideUsed" ]);
    });
  });

  Scenario("dotenv loaded with a truthy override option", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsSource("dotenv-override-truthy.js");
    });

    Then("the override option is reported, since dotenv tests it for truthiness", () => {
      expect(reported).to.eql([ "overrideUsed" ]);
    });
  });

  Scenario("dotenv loaded without the override option", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintAsSource("dotenv-plain.js");
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("another library's unrelated override option", () => {
    let reported;
    When("we lint a file that does not use dotenv at all", async () => {
      reported = await lintAsSource("config-not-dotenv.js");
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });
});
