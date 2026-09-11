import { ESLint } from "eslint";
import fs from "fs";
import os from "os";
import path from "path";

// Fixtures are written inline rather than committed under test/data, for two reasons. These rules
// are about credentials, disabled TLS verification and unguarded database hosts, so committed
// fixtures would put the very patterns we warn about into this repository, where code scanning
// reports them for as long as they live here. And the two project level rules read a project's
// runner config and .gitignore off disk, walking up to the repository root, so a fixture inside this
// repository would inherit this repository's own setup instead of being judged on its own.
const testConfig = path.resolve("test-js.js");
const sourceConfig = path.resolve("js.js");

function safetyMessages(result) {
  return result.messages.filter(({ ruleId }) => ruleId?.startsWith("bn-safety/"));
}

// Most scenarios compare the ids of the messages that were reported rather than their text, which
// keeps the wording free to improve.
function ids(messages) {
  return messages.map(({ messageId }) => messageId);
}

// Lints a snippet with no project around it, which is all the rules that only read code need.
async function lintSnippet(configFile, code, filePath) {
  const eslint = new ESLint({ overrideConfigFile: configFile, ignore: false });
  const [ result ] = await eslint.lintText(code, { filePath });

  return ids(safetyMessages(result));
}

function lintTestFile(code) {
  return lintSnippet(testConfig, code, "test/inline-test.js");
}

function lintSourceFile(code) {
  return lintSnippet(sourceConfig, code, "inline-source.js");
}

// Writes a whole project into a temporary directory and lints the files given, with the project as
// the working directory, which is where a test runner would start. Returns the reported messages per
// linted file.
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

    return results.map(safetyMessages);
  } finally {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
}

const probe = "export const answer = 42;\n";
const pinFile = 'process.env.NODE_CONFIG_ENV = "test";\n';
const guardImport = 'import "@bonniernews/stayput/register";\n';
const guardedMocharc = JSON.stringify({ require: [ "./test/helpers/env.js", "@bonniernews/stayput/register" ] });
const ignoresEnv = "node_modules\n.env\n";

// A service with a database and mocha, which is what most of the fleet looks like.
function manifest(extra = {}) {
  return JSON.stringify({
    name: "service",
    scripts: { test: "mocha" },
    dependencies: { pg: "^8.16.3" },
    devDependencies: { mocha: "^11.7.5" },
    ...extra,
  });
}

Feature("detecting missing test guards in a project", () => {
  Scenario("a project with a database and no runner config at all", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": manifest(),
        ".gitignore": ignoresEnv,
        "test/probe.js": probe,
      });
    });

    Then("both the missing guard and the missing pin are reported", () => {
      expect(ids(reported)).to.eql([ "missingGuard", "missingPin" ]);
    });

    And("the message says where we looked, so the gap is actionable", () => {
      expect(reported[0].message).to.have.string("the npm test script");
    });
  });

  Scenario("a project whose mocha config loads neither guard", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": manifest(),
        ".mocharc.json": JSON.stringify({ require: [ "./test/helpers/setup.js" ] }),
        ".gitignore": "node_modules\n",
        // Pinning NODE_ENV is not enough: exp-config prefers NODE_CONFIG_ENV over it.
        "test/helpers/setup.js": 'process.env.NODE_ENV = "test";\n',
        "test/probe.js": probe,
      });
    });

    Then("the missing network guard is reported", () => {
      expect(ids(reported)).to.include("missingGuard");
    });

    And("the missing environment pin is reported", () => {
      expect(ids(reported)).to.include("missingPin");
    });

    And("the unignored .env is reported", () => {
      expect(ids(reported)).to.include("notIgnored");
    });
  });

  Scenario("a mocha project with both guards wired up", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": manifest(),
        ".mocharc.json": guardedMocharc,
        ".gitignore": ignoresEnv,
        "test/helpers/env.js": pinFile,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a project that anchors the guard in a setup file instead of the runner config", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": manifest(),
        ".mocharc.json": JSON.stringify({ require: [ "./test/helpers/env.js" ] }),
        ".gitignore": ignoresEnv,
        // stayput documents this as runner-proofing, so it has to count as loading the guard.
        "test/helpers/env.js": `${guardImport}${pinFile}`,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a runner config written the way the runner allows rather than the way we expect", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": manifest(),
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
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a pin file that mentions the variable without pinning it", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": manifest(),
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
      expect(ids(reported)).to.eql([ "missingPin" ]);
    });
  });

  Scenario("a runner config that lives in package.json", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        // Mocha merges the mocha key with the rc file rather than picking one, so both are read.
        "package.json": manifest({ mocha: { require: [ "./test/helpers/env.js", "@bonniernews/stayput/register" ] } }),
        ".mocharc.json": JSON.stringify({ reporter: "spec" }),
        // A wildcard pattern, which is how plenty of repos ignore .env and its variants.
        ".gitignore": "node_modules\n.env*\n",
        "test/helpers/env.js": pinFile,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(ids(reported)).to.eql([]);
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
          "packages/orders/package.json": manifest(),
          "packages/orders/test/probe.js": probe,
        },
        [ "packages/orders/test/probe.js" ]
      );
    });

    Then("nothing is reported, since the guards sit above the workspace", () => {
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a project with more than one test file", () => {
    let reported;
    When("we lint three test files in the same unguarded project", async () => {
      const perFile = await lintProject(
        {
          "package.json": manifest(),
          ".gitignore": ignoresEnv,
          "test/one.js": probe,
          "test/two.js": probe,
          "test/three.js": probe,
        },
        [ "test/one.js", "test/two.js", "test/three.js" ]
      );

      reported = ids(perFile.flat());
    });

    // Which file carries the warning is whichever one the linter reached first, and that is not
    // guaranteed. What matters is that a project level fact is stated once for the project, rather
    // than repeated on every test file in it.
    Then("the project level facts are reported once for the whole project", () => {
      expect(reported).to.eql([ "missingGuard", "missingPin" ]);
    });
  });
});

Feature("detecting missing test guards whatever the test runner", () => {
  Scenario("a jest project with the guard in setupFiles", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": JSON.stringify({
          name: "service",
          scripts: { test: "jest" },
          dependencies: { pg: "^8.16.3" },
          devDependencies: { jest: "^30.2.0" },
        }),
        "jest.config.js": 'export default { setupFiles: [ "./test/helpers/env.js" ] };\n',
        ".gitignore": ignoresEnv,
        "test/helpers/env.js": `${guardImport}${pinFile}`,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a jest project with nothing loaded before the tests", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": JSON.stringify({
          name: "service",
          scripts: { test: "jest" },
          dependencies: { mongodb: "^7.6.0" },
          devDependencies: { jest: "^30.2.0" },
        }),
        "jest.config.js": 'export default { testEnvironment: "node" };\n',
        ".gitignore": ignoresEnv,
        "test/probe.js": probe,
      });
    });

    Then("both gaps are reported", () => {
      expect(ids(reported)).to.eql([ "missingGuard", "missingPin" ]);
    });

    And("the advice names jest rather than mocha", () => {
      expect(reported[0].message).to.have.string("setupFiles in the jest config");
    });
  });

  Scenario("a vitest project with the guard in its config", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": JSON.stringify({
          name: "service",
          scripts: { test: "vitest run" },
          dependencies: { redis: "^4.7.0" },
          devDependencies: { vitest: "^3.2.4" },
        }),
        "vitest.config.ts": 'export default { test: { setupFiles: [ "./test/helpers/env.ts" ] } };\n',
        ".gitignore": ignoresEnv,
        "test/helpers/env.ts": `${guardImport}${pinFile}`,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a node --test project preloading the guard from the test script", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        // Node's own runner has no config file, so the command line is the whole setup.
        "package.json": JSON.stringify({
          name: "service",
          scripts: { test: "NODE_CONFIG_ENV=test node --import @bonniernews/stayput/register --test test/probe.js" },
          dependencies: { pg: "^8.16.3" },
        }),
        ".gitignore": ignoresEnv,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported", () => {
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a node --test project with a bare test script", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": JSON.stringify({
          name: "service",
          scripts: { test: "node --test" },
          dependencies: { pg: "^8.16.3" },
        }),
        ".gitignore": ignoresEnv,
        "test/probe.js": probe,
      });
    });

    Then("both gaps are reported", () => {
      expect(ids(reported)).to.eql([ "missingGuard", "missingPin" ]);
    });

    And("the advice names the command line rather than a config file", () => {
      expect(reported[0].message).to.have.string("--import @bonniernews/stayput/register");
    });
  });

  Scenario("a project using a runner we do not know how to inspect", () => {
    let reported;
    When("we lint one of its test files", async () => {
      [ reported ] = await lintProject({
        "package.json": JSON.stringify({
          name: "service",
          scripts: { test: "some-other-runner" },
          dependencies: { pg: "^8.16.3" },
        }),
        ".gitignore": ignoresEnv,
        "test/probe.js": probe,
      });
    });

    Then("nothing is reported, since we cannot read a setup we do not understand", () => {
      expect(ids(reported)).to.eql([]);
    });
  });

  Scenario("a project with no database dependency", () => {
    let reported;
    When("we lint a test file in a library whose runner loads no guards", async () => {
      [ reported ] = await lintProject({
        "package.json": JSON.stringify({
          name: "library",
          scripts: { test: "mocha" },
          devDependencies: { mocha: "^11.7.5" },
        }),
        ".mocharc.json": JSON.stringify({ reporter: "spec" }),
        ".gitignore": "node_modules\n",
        "test/probe.js": probe,
      });
    });

    Then("the project level rules stay silent, since there is nothing to guard", () => {
      expect(ids(reported)).to.eql([]);
    });
  });
});

Feature("keeping test connections on this machine", () => {
  Scenario("a test file naming hosts outside this machine", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintTestFile([
        'const orders = "postgres://orders-db.prod.example.com:5432/orders";',
        'const cluster = "mongodb+srv://cluster0.mongodb.net/app";',
        "const cache = `redis://cache.prod.example.com:6379/${process.env.CACHE_INDEX}`;",
        'process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";',
        "const client = { tls: { rejectUnauthorized: false } };",
        "export default { orders, cluster, cache, client };",
      ].join("\n"));
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
      reported = await lintTestFile([
        'const orders = "postgres://localhost:5432/orders_test";',
        'const events = "mongodb://127.0.0.1:27017/events_test";',
        'const service = "postgres://postgres:5432/orders_test";',
        'const cache = "redis://[::1]:6379";',
        'const api = "https://api.example.com/v1/orders";',
        "// A host read out of config cannot be judged here, so neither of these is reported.",
        "const fromConfig = `redis://${config.cacheHost}:6379`;",
        "const fromEnvironment = `postgres://${process.env.DB_HOST}:5432/orders`;",
        "// Turning verification back on is the safe direction.",
        'process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";',
        "export default { orders, events, service, cache, api, fromConfig, fromEnvironment };",
      ].join("\n"));
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
      reported = await lintTestFile([
        'import nock from "nock";',
        'process.env.NODE_CONFIG_ENV = "test";',
        "nock.disableNetConnect();",
      ].join("\n"));
    });

    Then("we are told the import runs before the pin", () => {
      expect(reported).to.eql([ "pinHasImports" ]);
    });
  });

  Scenario("a pin file that requires a module", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintTestFile([
        'const logger = require("../lib/logger.js");',
        'process.env.NODE_CONFIG_ENV = "test";',
        "module.exports = logger;",
      ].join("\n"));
    });

    Then("a require is treated the same way as an import", () => {
      expect(reported).to.eql([ "pinHasImports" ]);
    });
  });

  Scenario("an import free pin file", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintTestFile([
        'process.env.NODE_ENV = "test";',
        'process.env.NODE_CONFIG_ENV = "test";',
        'process.env.ALLOW_TEST_ENV_OVERRIDE = "";',
      ].join("\n"));
    });

    Then("nothing is reported, and setting the pin itself is not treated as tampering", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("code that opens the escape hatches", () => {
    let reported;
    When("we lint a file that widens the guard and re-enables config overrides", async () => {
      reported = await lintTestFile([
        'import stayput from "@bonniernews/stayput";',
        'process.env.STAYPUT_ALLOW = "orders-db.prod.example.com";',
        'globalThis.process.env.STAYPUT_DISABLE = "I_UNDERSTAND_THE_RISK";',
        'process.env["STAYPUT_DENY"] = "cache.prod.example.com";',
        'process.env.ALLOW_TEST_ENV_OVERRIDE = "1";',
        'stayput.enable({ allow: [ "orders-db.prod.example.com" ] });',
      ].join("\n"));
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
  // Assembled rather than spelled out, so that a repository of lint rules does not itself carry the
  // byte sequence every secret scanner looks for.
  const privateKeyHeader = `-----BEGIN RSA ${"PRIVATE"} KEY-----`;

  Scenario("a file with real looking credentials", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintSourceFile([
        'const orders = "postgres://svc_orders:s3cret-value@orders-db.prod.example.com:5432/orders";',
        "const cluster = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mongodb.net/app`;",
        'const cache = "redis://:an0ther-s3cret@cache.prod.example.com:6379";',
        `const signingKey = "${privateKeyHeader}";`,
        'const connection = { host: "orders-db.prod.example.com", password: "a-real-looking-password" };',
        "class Client {",
        '  password = "another-real-looking-one";',
        "}",
        "export default { orders, cluster, cache, signingKey, connection, Client };",
      ].join("\n"));
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
      reported = await lintSourceFile([
        'const local = "postgres://orders:orders@localhost:5432/orders_test";',
        'const service = "mongodb://root:example@mongo:27017/app_test";',
        "// A documentation example on a real looking host, recognised by its placeholder credentials.",
        'const documented = "postgres://username:password@db.example.com:5432/orders";',
        "// Prose in a secret shaped property, which is what a message catalogue looks like.",
        'const copy = { secret: "The shared secret is set per environment" };',
        "// Short fixture values and placeholders are not credentials.",
        'const fixture = { host: "localhost", password: "test" };',
        'const short = { password: "abc123" };',
        'const template = { password: "<your-password>" };',
        "export default { local, service, documented, copy, fixture, short, template };",
      ].join("\n"));
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
      reported = await lintTestFile([
        'import nock from "nock";',
        "nock.enableNetConnect();",
        'nock.enableNetConnect("");',
        "nock.enableNetConnect(/.*/);",
        "// A real allow list is the point of the rule, so this one is left alone.",
        "nock.enableNetConnect(/(localhost|127\\.0\\.0\\.1):\\d+/);",
      ].join("\n"));
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
      // The form dotenv's own readme leads with. The call is visited before the require, so the rule
      // has to look at the whole file before deciding.
      reported = await lintSourceFile('require("dotenv").config({ override: true });\n');
    });

    Then("the override option is reported", () => {
      expect(reported).to.eql([ "overrideUsed" ]);
    });
  });

  Scenario("dotenv loaded with a truthy override option", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintSourceFile('import dotenv from "dotenv";\n\ndotenv.config({ override: 1 });\n');
    });

    Then("the override option is reported, since dotenv tests it for truthiness", () => {
      expect(reported).to.eql([ "overrideUsed" ]);
    });
  });

  Scenario("dotenv loaded without the override option", () => {
    let reported;
    When("we lint it", async () => {
      reported = await lintSourceFile([
        'import dotenv from "dotenv";',
        "dotenv.config({ quiet: true });",
        "dotenv.config({ override: false });",
      ].join("\n"));
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });

  Scenario("another library's unrelated override option", () => {
    let reported;
    When("we lint a file that does not use dotenv at all", async () => {
      reported = await lintSourceFile([
        'import telemetry from "./telemetry.js";',
        "telemetry.config({ override: true });",
      ].join("\n"));
    });

    Then("nothing is reported", () => {
      expect(reported).to.eql([]);
    });
  });
});
