"use strict";

const typescriptBasePromise = require("./ts");
const reactPlugin = require("eslint-plugin-react");
const reactRules = require("./react-rules");

module.exports = (async () => {
  const typescriptBase = await typescriptBasePromise;

  return {
    ...typescriptBase,
    plugins: { ...typescriptBase.plugins, react: reactPlugin },
    files: [ "**/*.tsx" ],
    rules: { ...typescriptBase.rules, ...reactRules },
    settings: { "import/resolver": { node: { extensions: [ ".ts", ".js", ".tsx", ".jsx" ] } } },
  };
})();
