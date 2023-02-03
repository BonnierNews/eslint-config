"use strict";

const baseConfig = require(".");

module.exports = {
  extends: [ "plugin:react/recommended" ],
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    "react/prop-types": 0,
    "react/react-in-jsx-scope": 2,
    "react/jsx-first-prop-new-line": [ 2, "multiline" ],
    "react/jsx-max-props-per-line": [ 2, { maximum: { single: 3, multi: 1 } } ],
    "react/jsx-closing-bracket-location": [ 2, "tag-aligned" ],
    "react/jsx-uses-react": 2,
    "react/destructuring-assignment": [ 2, "always" ],
    "react/prefer-stateless-function": [ 2, { ignorePureComponents: false } ],
    "react/function-component-definition": [ 1, { namedComponents: "arrow-function" } ],
    "react/jsx-indent": [ 2, 2 ],
    "react/jsx-tag-spacing": [ 2, { beforeSelfClosing: "always" } ],
  },
  parserOptions: {
    ...baseConfig.parserOptions,
    jsx: true,
  },
  overrides: [
    { files: [ "*.jsx" ] },
  ],
};
