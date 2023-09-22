"use strict";

const eslintReactRecommendedRules = {
  "react/display-name": 2,
  "react/jsx-key": 2,
  "react/jsx-no-comment-textnodes": 2,
  "react/jsx-no-duplicate-props": 2,
  "react/jsx-no-target-blank": 2,
  "react/jsx-no-undef": 2,
  "react/jsx-uses-react": 2,
  "react/jsx-uses-vars": 2,
  "react/no-children-prop": 2,
  "react/no-danger-with-children": 2,
  "react/no-deprecated": 2,
  "react/no-direct-mutation-state": 2,
  "react/no-find-dom-node": 2,
  "react/no-is-mounted": 2,
  "react/no-render-return-value": 2,
  "react/no-string-refs": 2,
  "react/no-unescaped-entities": 2,
  "react/no-unknown-property": 2,
  "react/no-unsafe": 0,
  "react/react-in-jsx-scope": 2,
  "react/require-render-return": 2,
};

module.exports = {
  ...eslintReactRecommendedRules,
  "react/prop-types": 0,
  "react/jsx-first-prop-new-line": [ 2, "multiline" ],
  "react/jsx-max-props-per-line": [1, { "when": "multiline" }],
  "react/jsx-closing-bracket-location": [ 2, "tag-aligned" ],
  "react/destructuring-assignment": [ 2, "always" ],
  "react/prefer-stateless-function": [ 2, { ignorePureComponents: false } ],
  "react/function-component-definition": [ 2, { namedComponents: "function-declaration", unnamedComponents: "arrow-function" } ],
  "react/jsx-indent": [ 2, 2 ],
  "react/jsx-tag-spacing": [ 2, { beforeSelfClosing: "always" } ],
  "react/jsx-indent-props": [ 2, 2 ],
};
