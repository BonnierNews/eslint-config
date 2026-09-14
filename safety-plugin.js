import fs from "fs";
import path from "path";

// The bn-safety rules, exported at the bottom of this file as one ESLint plugin.
//
// Every rule here reports that a safety control is MISSING. None of them is the control. The
// network guard is @bonniernews/stayput, the environment pin is the import-free file a test runner
// loads first, and what still holds when someone has a tunnel to production open on localhost is
// database roles. What lint adds is reach: this package is a devDependency in every repo,
// Dependabot keeps it current, and its output shows up in CI and in the editor while the code is
// being written. That makes it a good place to notice a missing control, and a bad place to be one.
//
// The rules, in the order they are defined below. Each one has a comment above it saying what it
// flags, with examples of what does and does not trip it.
//
//   require-test-guards        the project loads no network guard, or no environment pin, before
//                              its tests run
//   gitignore-env              no .gitignore up to the repository root excludes .env
//   env-pin-must-not-import    the file that pins the environment also imports something, which
//                              then runs before the pin
//   no-env-pin-tampering       a network guard exception, or a config override, switched on from
//                              code instead of from the workflow file
//   no-remote-db-target        a test names a database host off this machine, or turns off TLS
//                              certificate verification
//   no-credentials-in-source   a credential, a private key or a secret written into a source file
//   no-widened-nock            nock told to allow every outbound http request
//   no-dotenv-override         dotenv's override option, which replaces a pin already applied
//
// What these rules cannot do, worth knowing before relying on them:
//
//   * Enforce anything. A consumer can set any of them to "off" in its own eslint.config.js. They
//     steer; stayput at connect time and database roles at the server are what enforce.
//   * Survive `eslint --cache`. A cached file is never handed to a rule, so the two rules that read
//     project files from disk (require-test-guards and gitignore-env) go quiet once a run is
//     cached. Run lint in CI without --cache if you rely on them.
//   * See past one file's syntax. A host kept in a variable, a connection string assembled at
//     runtime, or an environment variable written through an alias all pass unseen. The README
//     lists the blind spots we know about.
//
// Why each check is its own named rule rather than an entry in no-restricted-syntax: rule options
// replace rather than merge, so a single no-restricted-syntax entry in a consumer's config, or in a
// later config block here, would silently delete every check sharing that rule name, with nothing
// to show that anything had been dropped. Named rules cannot be clobbered that way.

// The test runners we know how to inspect, and where each keeps the list of files it loads before
// the tests. A project that uses none of them is left alone rather than guessed at, so adding a
// runner here is how coverage grows; leaving one out costs silence, never a false report.
const TEST_RUNNERS = [
  {
    name: "mocha",
    package: "mocha",
    // Mocha's own order of preference, kept in sync with mocha/lib/cli/config.js. Note that
    // `.mocharc.mjs` is not among them: mocha does not read it.
    configFiles: [ ".mocharc.cjs", ".mocharc.js", ".mocharc.yaml", ".mocharc.yml", ".mocharc.jsonc", ".mocharc.json" ],
    manifestKey: "mocha",
    setupHint: "the require list in .mocharc.json",
  },
  {
    name: "jest",
    package: "jest",
    configFiles: [
      "jest.config.js",
      "jest.config.cjs",
      "jest.config.mjs",
      "jest.config.ts",
      "jest.config.mts",
      "jest.config.cts",
      "jest.config.json",
    ],
    manifestKey: "jest",
    setupHint: "setupFiles in the jest config",
  },
  {
    name: "vitest",
    package: "vitest",
    configFiles: [
      "vitest.config.js",
      "vitest.config.cjs",
      "vitest.config.mjs",
      "vitest.config.ts",
      "vitest.config.mts",
      "vite.config.js",
      "vite.config.mjs",
      "vite.config.ts",
      "vite.config.mts",
    ],
    setupHint: "test.setupFiles in the vitest config",
  },
  {
    name: "ava",
    package: "ava",
    configFiles: [ "ava.config.js", "ava.config.cjs", "ava.config.mjs" ],
    manifestKey: "ava",
    setupHint: "the require list in the ava config",
  },
  {
    name: "tap",
    package: "tap",
    configFiles: [ ".taprc", ".taprc.yaml", ".taprc.yml" ],
    manifestKey: "tap",
    setupHint: "the before option in .taprc",
  },
  {
    name: "node --test",
    // Node's own runner has no config file: whatever it preloads sits on the command line, so the
    // npm test script is the only place to look.
    testScriptPattern: /\bnode\b[^&|;]*\s--test\b/,
    configFiles: [],
    setupHint: "--import @bonniernews/stayput/register on the node --test command",
  },
];

// Packages that mean this project talks to a data store and therefore has something to lose. The
// project-level rules stay silent without one, so libraries are not asked to install a test network
// guard they have no use for. This package is itself such a library.
const DATA_STORE_PACKAGES = [
  "@elastic/elasticsearch",
  "@google-cloud/bigquery",
  "@google-cloud/firestore",
  "@google-cloud/pubsub",
  "@google-cloud/storage",
  "amqplib",
  "cassandra-driver",
  "ioredis",
  "knex",
  "mongodb",
  "mongoose",
  "mysql",
  "mysql2",
  "pg",
  "postgres",
  "prisma",
  "redis",
  "sequelize",
  "typeorm",
];

// Environment variables that decide which config a process loads, plus stayput's escape hatches.
const PIN_VARIABLES = [ "NODE_ENV", "NODE_CONFIG_ENV", "ALLOW_TEST_ENV_OVERRIDE" ];
const GUARD_VARIABLES = [ "STAYPUT_ALLOW", "STAYPUT_DENY", "STAYPUT_DISABLE" ];

const GUARD_PACKAGE = "@bonniernews/stayput";
const GUARD_ENTRY_POINT = `${GUARD_PACKAGE}/register`;

// The side of stayput's programmatic API that widens what tests may reach.
const GUARD_EXCEPTION_OPTIONS = [ "allow", "deny" ];

// Anything that can appear in a mocha config's require list, in JSON, JavaScript or YAML, quoted or
// not. Resolved against the config's own directory and filtered down to files that exist.
const MODULE_PATH = /[\w@./-]+\.(?:js|cjs|mjs|ts)\b/g;

// Schemes whose hosts are databases, caches and brokers. http and https are left out on purpose:
// feature tests name remote http hosts constantly and mock them with nock, so including them would
// bury the signal in noise.
const CONNECTION_URI = /\b(?:postgres|postgresql|mongodb\+srv|mongodb|mysql|mariadb|rediss|redis|amqps|amqp|elasticsearch|kafka):\/\/(?:[^@\s/]*@)?(\[[^\]\s]+\]|[^\s/:?#]+)/gi;

// A URI carrying its own credentials: scheme://user:password@host
const CREDENTIALED_URI = /\b([a-z][a-z0-9+.-]*):\/\/([^\s/:@]*):([^\s/:@]+)@(\[[^\]\s]+\]|[^\s/:?#]+)/gi;

// Arguments to nock's enableNetConnect that allow every host, so they are no narrower than passing
// nothing at all. A predicate function or a cleverer pattern cannot be judged here.
const MATCHES_EVERY_HOST = new Set([ ".*", ".+", "^.*$", "^.+$", "[\\s\\S]*", "[\\s\\S]+" ]);

const PRIVATE_KEY_HEADER = /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/;

// The environment pin as the template writes it. The value matters: a file setting NODE_CONFIG_ENV
// to anything but "test" is not a pin. `=(?!=)` keeps a comparison such as `=== "test"` from
// counting as an assignment.
const ENV_PIN = /process\.env\.NODE_CONFIG_ENV\s*=(?!=)\s*["']test["']/;

// The same pin written as a shell assignment in front of the runner, as in
// `NODE_CONFIG_ENV=test mocha`. NODE_ENV=test on its own does not count: exp-config prefers
// NODE_CONFIG_ENV, so that is the variable that has to be nailed down.
const ENV_PIN_IN_SCRIPT = /\bNODE_CONFIG_ENV=(["']?)test\1(?:\s|$)/;

// Property names whose value is a secret if it is a real one.
const SECRET_PROPERTIES = new Set([
  "accessToken",
  "apiKey",
  "clientSecret",
  "passwd",
  "password",
  "privateKey",
  "refreshToken",
  "secret",
  "secretKey",
]);

// Values that name a secret rather than being one: documentation placeholders and obvious fixtures.
// An interpolation such as ${process.env.DB_PASSWORD} is deliberately not in this list. It reads
// like a placeholder but it puts a real credential into the string at runtime, which is the most
// common way a production connection string ends up in a source file.
const PLACEHOLDER_VALUE = /^(?:user(?:name)?|pass(?:word|wd)?|secret|token|key|changeme|change[-_]me|example|examples|dummy|fake|placeholder|redacted|test|x+|\*+|<[^>]*>|your[-_]?\w*)$/i;

// A real credential is long and has no spaces in it. Shorter values in a password field are almost
// always fixtures, and values containing whitespace are prose: message catalogs, translations and
// schema descriptions all have properties called "secret" or "privateKey" holding a sentence.
// Reporting either of those teaches people to disable the rule.
const MIN_SECRET_LENGTH = 12;
const WHITESPACE = /\s/;

// Project-level facts are true for the whole project, not for one file, so reporting them on every
// test file would bury a repo of a few hundred tests under identical warnings. The first file that
// reports a given fact keeps it, and re-linting that same file keeps the warning visible while
// someone works on it in an editor.
const reportOwners = new Map();

function ownsProjectReport(ruleName, projectDir, filename) {
  const key = `${ruleName}\n${projectDir}`;
  const owner = reportOwners.get(key);

  if (owner === undefined) {
    reportOwners.set(key, filename);
    return true;
  }

  return owner === filename;
}

// Config files and setup files are searched for what they *do*, so a commented-out require line or
// a "TODO: add the guard" note must not count as the real thing.
function withoutComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*(?:\/\/|#).*$/gm, "");
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Every directory from the linted file up to the repository root, nearest first. Mocha looks for its
// config by walking up like this, and git applies every .gitignore along the way, so both project
// level rules have to look at more than one directory.
function directoriesUpToRepoRoot(startDir) {
  const directories = [];
  let dir = startDir;
  let previous = null;

  while (dir !== previous) {
    directories.push(dir);

    if (fs.existsSync(path.join(dir, ".git"))) break;

    previous = dir;
    dir = path.dirname(dir);
  }

  return directories;
}

// The package.json nearest to the linted file, which in a monorepo is the workspace package rather
// than the root. That is the manifest whose dependencies say whether this code talks to a database.
function findProject(filename) {
  if (!filename || !path.isAbsolute(filename)) return null; // linting a string, not a file on disk

  for (const dir of directoriesUpToRepoRoot(path.dirname(filename))) {
    const manifestFile = path.join(dir, "package.json");

    if (!fs.existsSync(manifestFile)) continue;

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));

      // A package.json that is valid JSON but not an object would crash the rules below, and a
      // crashing rule fails the whole lint run. Whatever is wrong with it is not ours to report.
      return isPlainObject(manifest) ? { dir, manifest } : null;
    } catch {
      return null; // an unparseable package.json is someone else's error to report
    }
  }

  return null;
}

function usesDataStore({ manifest }) {
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  return DATA_STORE_PACKAGES.some((name) => name in dependencies);
}

// Everything a project loads before its tests, as one blob of text plus the directories that
// relative paths in it resolve against. Which runners to ask is decided by the dependencies, and
// each runner's config is looked for by walking up to the repository root, the way the runners
// themselves do. The npm test script is always included: a guard preloaded with --import or
// NODE_OPTIONS lives there rather than in any runner's config, whatever the runner.
//
// Returns null when the project uses no runner we know how to inspect, which is the signal to say
// nothing at all.
//
// The project files are read fresh on every linted file rather than cached: a handful of existsSync
// calls costs almost nothing next to parsing a file, and a cache that survives between runs goes
// stale in an editor's long lived eslint server, which is the harder bug to find.
function testSetup(filename, project) {
  const { manifest } = project;
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  const testScript = String(manifest.scripts?.test ?? "");

  const runners = TEST_RUNNERS.filter((runner) =>
    (runner.package !== undefined && runner.package in dependencies)
    || (runner.testScriptPattern !== undefined && runner.testScriptPattern.test(testScript))
  );

  if (runners.length === 0) return null;

  const sources = [];
  const parts = [ testScript ];
  const dirs = new Set([ project.dir ]);

  for (const runner of runners) {
    for (const candidate of directoriesUpToRepoRoot(path.dirname(filename))) {
      const name = runner.configFiles.find((file) => fs.existsSync(path.join(candidate, file)));

      if (name) {
        dirs.add(candidate);
        sources.push(name);
        parts.push(fs.readFileSync(path.join(candidate, name), "utf8"));
        break;
      }
    }

    // Jest, mocha, ava and tap can all keep their config in package.json instead of a file, and
    // mocha merges the two rather than picking one, so both are read.
    if (runner.manifestKey !== undefined && manifest[runner.manifestKey]) {
      sources.push(`the ${runner.manifestKey} key in package.json`);
      parts.push(JSON.stringify(manifest[runner.manifestKey]));
    }
  }

  sources.push("the npm test script");

  return {
    runners: runners.map(({ name }) => name).join(" and "),
    setupHint: runners.map(({ setupHint }) => setupHint).join(", or "),
    sources: sources.join(", "),
    text: parts.join("\n"),
    dirs: [ ...dirs ],
  };
}

// The files a project loads before its tests, as absolute paths. Only files that exist are returned,
// which is also how a bare path such as "test/helpers/env.js" is told apart from a package name: the
// runners resolve both, and so does this.
function requiredFiles(setup) {
  const files = new Set();

  for (const [ candidate ] of setup.text.matchAll(MODULE_PATH)) {
    for (const dir of setup.dirs) {
      const file = path.resolve(dir, candidate);

      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        files.add(file);
      }
    }
  }

  return [ ...files ];
}

function contentsOf(files) {
  return files.map((file) => withoutComments(fs.readFileSync(file, "utf8")));
}

// True when the guard is loaded before the tests, either straight from the mocha config or from one
// of the files it requires. stayput documents both, and its other entry points are not equivalent:
// the package root never calls enable(), and the /mocha entry only asserts that the guard is already
// active. Loading it through NODE_OPTIONS, which the CI templates do, is invisible from here.
function loadsNetworkGuard(setup, setupFiles) {
  return withoutComments(setup.text).includes(GUARD_ENTRY_POINT)
    || contentsOf(setupFiles).some((text) => text.includes(GUARD_ENTRY_POINT));
}

// True when one of the files the mocha config loads pins the environment for exp-config. It has to
// be NODE_CONFIG_ENV: exp-config prefers that variable over NODE_ENV, so a setup file that only sets
// NODE_ENV still loads production config when NODE_CONFIG_ENV leaks in from the shell.
function pinsEnvironment(setup, setupFiles) {
  return ENV_PIN_IN_SCRIPT.test(setup.text)
    || contentsOf(setupFiles).some((text) => ENV_PIN.test(text));
}

function isLoopbackOrService(host) {
  const name = host.replace(/^\[|\]$/g, "").toLowerCase();

  if (name === "localhost" || name === "::1" || name === "0.0.0.0" || name === "host.docker.internal") return true;
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(name)) return true;

  // A single-label name is almost always a docker compose service or a CI service container. It can
  // also be a Kubernetes or Consul service name that resolves to real infrastructure, which this
  // cannot tell apart, so single-label hosts are left alone.
  return !name.includes(".");
}

function isPlaceholder(value) {
  return PLACEHOLDER_VALUE.test(value);
}

// True for a member expression naming the process environment, whether reached as `process.env` or
// as `globalThis.process.env`. An alias such as `const { env } = process` is not recognised.
function isProcessEnv(node) {
  if (node.type !== "MemberExpression") return false;
  if ((node.property.name ?? node.property.value) !== "env") return false;

  const container = node.object;

  if (container.type === "Identifier") return container.name === "process";

  return container.type === "MemberExpression"
    && container.object.type === "Identifier"
    && container.object.name === "globalThis"
    && (container.property.name ?? container.property.value) === "process";
}

// The name of the environment variable an assignment writes to, for `process.env.NAME = …` and
// `process.env["NAME"] = …` alike. A name held in a variable cannot be resolved and returns null.
function assignedEnvVariable(node) {
  const { left } = node;

  if (left.type !== "MemberExpression" || !isProcessEnv(left.object)) return null;

  return left.property.name ?? left.property.value ?? null;
}

// Everything except an explicitly falsy literal counts as enabling a flag, because exp-config and
// stayput both test their variables for truthiness. Note that the string "0" is truthy in
// JavaScript, so only "" and the falsy literals are treated as off.
function enablesFlag(valueNode) {
  if (valueNode.type === "Literal") {
    return Boolean(valueNode.value);
  }

  return valueNode.type !== "Identifier" || valueNode.name !== "undefined";
}

// Node turns TLS verification off for the value "0" only. Anything else, including "1", leaves it on.
function disablesTls(valueNode) {
  return valueNode.type === "Literal" && (valueNode.value === "0" || valueNode.value === 0 || valueNode.value === false);
}

function requiredModuleName(node) {
  if (node.type !== "CallExpression") return null;
  if (node.callee.type !== "Identifier" || node.callee.name !== "require") return null;

  const [ argument ] = node.arguments;

  return argument?.type === "Literal" && typeof argument.value === "string" ? argument.value : null;
}

function calledMemberName(callee) {
  if (callee.type === "MemberExpression") return callee.property.name ?? callee.property.value ?? null;

  return callee.type === "Identifier" ? callee.name : null;
}

// True for an argument to enableNetConnect that allows everything anyway: an empty string, or a
// pattern with no constraint in it.
function allowsEveryHost(argument) {
  if (argument.type !== "Literal") return false;
  if (argument.regex) return MATCHES_EVERY_HOST.has(argument.regex.pattern);

  return argument.value === "";
}

function propertyNamed(objectExpression, name) {
  return objectExpression.properties.find(
    (property) => property.type === "Property" && (property.key.name ?? property.key.value) === name
  );
}

// A string inside a template literal is already covered when the template itself is checked, and a
// nested template would be checked twice. Skipping those keeps one problem to one warning.
function insideTemplateLiteral(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "TemplateLiteral") return true;
  }

  return false;
}

// Rule: require-test-guards
//
// Looks at the project rather than at the file being linted: does anything load the network guard,
// and does anything pin the environment, before the tests run? Those are the two things that keep a
// test suite from resolving its config to a real environment and then reaching it.
//
//   flagged      a project depending on pg whose .mocharc.json requires only a setup file that
//                sets NODE_ENV, since exp-config prefers NODE_CONFIG_ENV and would ignore it
//   not flagged  the same project once its require list has "@bonniernews/stayput/register" and a
//                file containing process.env.NODE_CONFIG_ENV = "test"
//
// Scoping, so this does not shout at repos with nothing to protect: silent unless package.json
// depends on a data store, silent for a test runner it does not know how to read, and reported once
// per project rather than once per test file.
const requireTestGuards = {
  meta: {
    type: "problem",
    docs: { description: "require the project to load a network guard and an environment pin before its tests" },
    schema: [],
    messages: {
      missingGuard:
        "Nothing this project loads before its {{runners}} tests brings in \"{{guardEntryPoint}}\", so these tests can "
        + "open connections to any host this machine can reach. Add it to {{setupHint}}. Looked in: {{sources}}.",
      missingPin:
        "Nothing this project loads before its {{runners}} tests sets process.env.NODE_CONFIG_ENV to \"test\", so a "
        + "value leaking in from the shell decides which config the tests load. Pin it in an import-free file loaded from "
        + "{{setupHint}}. Looked in: {{sources}}.",
    },
  },
  create(context) {
    return {
      Program(node) {
        const project = findProject(context.filename);

        if (!project || !usesDataStore(project)) return;
        if (!ownsProjectReport("require-test-guards", project.dir, context.filename)) return;

        const setup = testSetup(context.filename, project);

        // No runner we know how to inspect. Saying nothing beats guessing at a setup we cannot read.
        if (!setup) return;

        const setupFiles = requiredFiles(setup);
        const data = {
          runners: setup.runners,
          setupHint: setup.setupHint,
          sources: setup.sources,
          guardEntryPoint: GUARD_ENTRY_POINT,
        };

        if (!loadsNetworkGuard(setup, setupFiles)) {
          context.report({ node, messageId: "missingGuard", data });
        }

        if (!pinsEnvironment(setup, setupFiles)) {
          context.report({ node, messageId: "missingPin", data });
        }
      },
    };
  },
};

// Rule: gitignore-env
//
// Also a project level check: does any .gitignore between the linted file and the repository root
// exclude .env? A .env holds local credentials, and an unignored one is a single `git add .` away
// from the remote.
//
//   flagged      a .gitignore listing only node_modules
//   not flagged  .env, /.env, .env*, *.env or **/.env, in any .gitignore up to the root
//
// Scoped like require-test-guards: data store only, once per project.
const gitignoreEnv = {
  meta: {
    type: "problem",
    docs: { description: "require .gitignore to exclude .env, so local credentials cannot be committed" },
    schema: [],
    messages: {
      notIgnored:
        "No .gitignore between this file and the repository root excludes .env, so a file of local credentials is one "
        + "\"git add .\" away from the remote. Add \".env\" to .gitignore.",
    },
  },
  create(context) {
    return {
      Program(node) {
        const project = findProject(context.filename);

        if (!project || !usesDataStore(project)) return;
        if (!ownsProjectReport("gitignore-env", project.dir, context.filename)) return;

        // Git applies every .gitignore from the repository root down, so one of them excluding .env
        // is enough. A global gitignore or .git/info/exclude is not visible here.
        const ignored = directoriesUpToRepoRoot(path.dirname(context.filename)).some((dir) => {
          const gitignoreFile = path.join(dir, ".gitignore");

          if (!fs.existsSync(gitignoreFile)) return false;

          return fs.readFileSync(gitignoreFile, "utf8").split("\n").some((line) => {
            const pattern = line.trim().replace(/^\*\*\//, "").replace(/^\//, "");
            return pattern === ".env" || pattern === ".env*" || pattern === "*.env";
          });
        });

        if (!ignored) {
          context.report({ node, messageId: "notIgnored" });
        }
      },
    };
  },
};

// Rule: env-pin-must-not-import
//
// A file that pins the test environment must not import or require anything. Imports are evaluated
// before the rest of the file, so an imported module reads the environment first and can resolve
// its config from whatever leaked in from the shell, while the pin applies a moment too late.
//
//   flagged      import nock from "nock";
//                process.env.NODE_CONFIG_ENV = "test";
//   not flagged  the same two lines split across two files, with the import-free pin loaded first
//
// The pin file identifies itself by what it does, not by its name, so this works whatever a repo
// calls the file.
const envPinMustNotImport = {
  meta: {
    type: "problem",
    docs: { description: "keep the file that pins the test environment free of imports" },
    schema: [],
    messages: {
      pinHasImports:
        "This file pins the test environment and also loads {{modules}}. Imported and required modules run before the "
        + "rest of the file, so they read the environment before the pin applies and can load the wrong config. Move the "
        + "pin into a separate import-free file and load it first in the mocha config.",
    },
  },
  create(context) {
    const modules = [];
    let pin = null;

    return {
      ImportDeclaration(node) {
        modules.push(node.source.value);
      },
      CallExpression(node) {
        const moduleName = requiredModuleName(node);

        if (moduleName) {
          modules.push(moduleName);
        }
      },
      AssignmentExpression(node) {
        if (!pin && PIN_VARIABLES.includes(assignedEnvVariable(node))) {
          pin = node;
        }
      },
      "Program:exit"() {
        if (!pin || modules.length === 0) return;

        context.report({
          node: pin,
          messageId: "pinHasImports",
          data: { modules: modules.map((name) => `"${name}"`).join(", ") },
        });
      },
    };
  },
};

// Rule: no-env-pin-tampering
//
// The switches that widen the network guard, or that let real environment variables override the
// test config, belong in the workflow file where a reviewer sees them and a fleet-wide grep finds
// them. Set from code they are invisible to both.
//
//   flagged      process.env.STAYPUT_ALLOW = "db.prod.example.com";
//                process.env.ALLOW_TEST_ENV_OVERRIDE = "1";
//                stayput.enable({ allow: [ "db.prod.example.com" ] });
//   not flagged  process.env.ALLOW_TEST_ENV_OVERRIDE = "";   the pin file turning it off
//
// Setting NODE_ENV or NODE_CONFIG_ENV is deliberately not flagged: that is the pin doing its job.
// env-pin-must-not-import covers the case where the pin sits in a file that cannot be trusted to
// run first.
const noEnvPinTampering = {
  meta: {
    type: "problem",
    docs: { description: "disallow switching on config overrides or network guard exceptions from code" },
    schema: [],
    messages: {
      guardVariable:
        "Do not set process.env.{{name}} from code. The network guard's exceptions belong in the workflow file, where a "
        + "reviewer sees them and a fleet-wide grep can find them.",
      guardOption:
        "Do not pass \"{{name}}\" to the network guard from code. Its exceptions belong in the workflow file, where a "
        + "reviewer sees them and a fleet-wide grep can find them.",
      overrideEnabled:
        "Setting process.env.ALLOW_TEST_ENV_OVERRIDE to a truthy value lets real environment variables override the test "
        + "config, which is how a leaked value reaches a test run.",
    },
  },
  create(context) {
    let usesGuard = false;
    const guardOptions = [];

    return {
      ImportDeclaration(node) {
        if (String(node.source.value).startsWith(GUARD_PACKAGE)) {
          usesGuard = true;
        }
      },
      AssignmentExpression(node) {
        const name = assignedEnvVariable(node);

        if (!name) return;

        if (GUARD_VARIABLES.includes(name)) {
          context.report({ node, messageId: "guardVariable", data: { name } });
          return;
        }

        if (name === "ALLOW_TEST_ENV_OVERRIDE" && enablesFlag(node.right)) {
          context.report({ node, messageId: "overrideEnabled" });
        }
      },
      CallExpression(node) {
        if (String(requiredModuleName(node)).startsWith(GUARD_PACKAGE)) {
          usesGuard = true;
          return;
        }

        // stayput.enable({ allow: [...] }) widens the guard exactly as STAYPUT_ALLOW does.
        if (calledMemberName(node.callee) !== "enable") return;

        const [ options ] = node.arguments;

        if (options?.type !== "ObjectExpression") return;

        for (const name of GUARD_EXCEPTION_OPTIONS) {
          const option = propertyNamed(options, name);

          if (option) {
            guardOptions.push({ node: option, name });
          }
        }
      },
      "Program:exit"() {
        if (!usesGuard) return;

        for (const { node, name } of guardOptions) {
          context.report({ node, messageId: "guardOption", data: { name } });
        }
      },
    };
  },
};

// Rule: no-remote-db-target
//
// Tests may only reach this machine. Flags a database, cache or broker host spelled out in a test
// file, and both ways of turning off TLS certificate verification, which is the usual step someone
// takes when a test is being pointed at real infrastructure.
//
//   flagged      "postgres://orders-db.prod.example.com:5432/orders"
//                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//                { rejectUnauthorized: false }
//   not flagged  "postgres://localhost:5432/orders_test"        this machine
//                "postgres://postgres:5432/app_test"            a compose or CI service
//                `postgres://${config.dbHost}/orders`           value not knowable here
//                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";  the safe direction
//
// http and https schemes are left out on purpose: feature tests name remote http hosts constantly
// and mock them with nock, so including them would bury the signal in noise.
const noRemoteDbTarget = {
  meta: {
    type: "problem",
    docs: { description: "disallow database hosts outside this machine, and disabled TLS verification, in tests" },
    schema: [],
    messages: {
      remoteHost:
        "This test names the non-local host \"{{host}}\". Tests may only reach this machine: run the database locally, or "
        + "use a service container that publishes to 127.0.0.1.",
      tlsDisabled:
        "Turning off TLS certificate verification in a test is how a test ends up talking to real infrastructure. Local "
        + "test databases do not need it.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function checkText(node, text) {
      for (const [ , host ] of text.matchAll(CONNECTION_URI)) {
        // A host built from a variable is the normal way to read one out of config, and its value is
        // not knowable here. Reporting it would make the rule unusable in exactly the repos that do
        // the right thing, so an interpolated host is left alone. The README says so.
        if (host.includes("${")) continue;

        if (!isLoopbackOrService(host)) {
          context.report({ node, messageId: "remoteHost", data: { host } });
        }
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string" && !insideTemplateLiteral(node)) {
          checkText(node, node.value);
        }
      },
      TemplateLiteral(node) {
        if (!insideTemplateLiteral(node)) {
          checkText(node, sourceCode.getText(node));
        }
      },
      AssignmentExpression(node) {
        if (assignedEnvVariable(node) === "NODE_TLS_REJECT_UNAUTHORIZED" && disablesTls(node.right)) {
          context.report({ node, messageId: "tlsDisabled" });
        }
      },
      "Property, PropertyDefinition"(node) {
        const name = node.key.name ?? node.key.value;

        if (name === "rejectUnauthorized" && node.value?.type === "Literal" && node.value.value === false) {
          context.report({ node, messageId: "tlsDisabled" });
        }
      },
    };
  },
};

// Rule: no-credentials-in-source
//
// Credentials belong in config or a secret manager. Written into a source file they are in the
// repository's history from then on, whatever happens to the file afterwards.
//
//   flagged      "postgres://svc_orders:s3cret-value@db.prod.example.com:5432/orders"
//                `mongodb+srv://${user}:${password}@cluster0.mongodb.net/app`
//                a PEM private key header
//                { password: "a-real-looking-password" }, including as a class field
//   not flagged  "postgres://orders:orders@localhost:5432/orders_test"   local credentials
//                "postgres://username:password@db.example.com/orders"    documentation placeholders
//                { secret: "The shared secret is set per environment" }  prose, not a secret
//                { password: "test" }                                    too short to be real
const noCredentialsInSource = {
  meta: {
    type: "problem",
    docs: { description: "disallow credentials, private keys and secrets written into source files" },
    schema: [],
    messages: {
      credentialInUri:
        "This URI carries a credential for \"{{host}}\". Read it from config or a secret manager, never from source.",
      privateKey: "This file contains private key material. Read it from config or a secret manager.",
      hardcodedSecret:
        "The \"{{name}}\" property has a hardcoded value that looks like a real credential. Read it from config or a "
        + "secret manager.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    function checkText(node, text) {
      for (const [ , , user, password, host ] of text.matchAll(CREDENTIALED_URI)) {
        if (host.includes("${")) continue; // the host comes from config, so its value is unknown here
        if (isLoopbackOrService(host)) continue; // a local development credential, not a leak
        if (isPlaceholder(user) && isPlaceholder(password)) continue; // a documentation example

        context.report({ node, messageId: "credentialInUri", data: { host } });
      }

      if (PRIVATE_KEY_HEADER.test(text)) {
        context.report({ node, messageId: "privateKey" });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string" && !insideTemplateLiteral(node)) {
          checkText(node, node.value);
        }
      },
      TemplateLiteral(node) {
        if (!insideTemplateLiteral(node)) {
          checkText(node, sourceCode.getText(node));
        }
      },
      // Both an object property and a class field, so `{ password: "…" }` and `password = "…"` are
      // treated alike.
      "Property, PropertyDefinition"(node) {
        const name = node.key.name ?? node.key.value;

        if (!SECRET_PROPERTIES.has(name)) return;
        if (node.value?.type !== "Literal" || typeof node.value.value !== "string") return;

        const value = node.value.value;

        if (value.length < MIN_SECRET_LENGTH || WHITESPACE.test(value) || isPlaceholder(value)) return;

        context.report({ node, messageId: "hardcodedSecret", data: { name } });
      },
    };
  },
};

// Rule: no-widened-nock
//
// In a suite that mocks http with nock, nock is what keeps requests on this machine. Calling
// enableNetConnect without a real allow list hands that back and lets every outbound request
// through again.
//
//   flagged      nock.enableNetConnect()      nothing is restricted
//                nock.enableNetConnect("")    matches every host
//                nock.enableNetConnect(/.*/)  same, written as a pattern
//   not flagged  nock.enableNetConnect(/(localhost|127\.0\.0\.1):\d+/)
//
// A predicate function cannot be judged from its syntax, so it is left alone.
const noWidenedNock = {
  meta: {
    type: "problem",
    docs: { description: "disallow re-enabling all outbound http in tests" },
    schema: [],
    messages: {
      allConnectionsEnabled:
        "enableNetConnect() without an argument re-enables every outbound http request. Pass the hosts the test needs, "
        + "for example /(localhost|127\\.0\\.0\\.1):\\d+/.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (calledMemberName(node.callee) !== "enableNetConnect") return;

        const [ argument ] = node.arguments;

        if (argument !== undefined && !allowsEveryHost(argument)) return;

        context.report({ node, messageId: "allConnectionsEnabled" });
      },
    };
  },
};

// Rule: no-dotenv-override
//
// dotenv's override option replaces variables that are already set, which includes the environment
// pin a test runner has just applied. Without the option dotenv leaves existing variables alone and
// the pin survives, which is why loading .env is safe in every other respect.
//
//   flagged      dotenv.config({ override: true });
//                require("dotenv").config({ override: 1 });   truthy counts
//   not flagged  dotenv.config();
//                dotenv.config({ override: false });
//                telemetry.config({ override: true });        not dotenv, none of our business
const noDotenvOverride = {
  meta: {
    type: "problem",
    docs: { description: "disallow dotenv's override option, which replaces an environment pin already applied" },
    schema: [],
    messages: {
      overrideUsed:
        "dotenv's override option replaces variables that are already set, which defeats any environment pin a test "
        + "runner applied. Load .env without it, from the script that starts the app.",
    },
  },
  create(context) {
    // Candidates are collected while walking and only reported once the whole file has been seen,
    // because `require("dotenv").config({ override: true })` reaches the call before the require.
    // Files that do not use dotenv are left alone, so an unrelated config() API is not reported.
    let usesDotenv = false;
    const candidates = [];

    return {
      ImportDeclaration(node) {
        if (String(node.source.value).startsWith("dotenv")) {
          usesDotenv = true;
        }
      },
      CallExpression(node) {
        if (String(requiredModuleName(node)).startsWith("dotenv")) {
          usesDotenv = true;
          return;
        }

        if (calledMemberName(node.callee) !== "config") return;

        const [ options ] = node.arguments;

        if (options?.type !== "ObjectExpression") return;

        const override = propertyNamed(options, "override");

        if (override && enablesFlag(override.value)) {
          candidates.push(override);
        }
      },
      "Program:exit"() {
        if (!usesDotenv) return;

        for (const candidate of candidates) {
          context.report({ node: candidate, messageId: "overrideUsed" });
        }
      },
    };
  },
};

export default {
  rules: {
    "require-test-guards": requireTestGuards,
    "gitignore-env": gitignoreEnv,
    "env-pin-must-not-import": envPinMustNotImport,
    "no-env-pin-tampering": noEnvPinTampering,
    "no-remote-db-target": noRemoteDbTarget,
    "no-credentials-in-source": noCredentialsInSource,
    "no-widened-nock": noWidenedNock,
    "no-dotenv-override": noDotenvOverride,
  },
};
