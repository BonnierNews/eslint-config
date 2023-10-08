"use strict";

module.exports = {
  rules: {
    "disallow-class-extends": require("./rules/disallow-class-extends.js"),
    "disallow-abstract-class": require("./rules/disallow-abstract-class.js"),
    "disallow-non-es-compatible": require("./rules/disallow-non-es-compatible.js"),
  },
  configs: {
    recommended: {
      plugins: [ "class-extends" ],
      parserOptions: { ecmaVersion: 6 },
      rules: {
        "class-extends/disallow-class-extends": "error",
        "class-extends/disallow-abstract-class": "error",
        "class-extends/disallow-non-es-compatible": "error",
      },
    },
  },
};
