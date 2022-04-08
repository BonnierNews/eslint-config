"use strict";

const eslintRecommendedRules = {
  "constructor-super": "error",
  "for-direction": "error",
  "getter-return": "error",
  "no-async-promise-executor": "error",
  "no-case-declarations": "error",
  "no-class-assign": "error",
  "no-compare-neg-zero": "error",
  "no-cond-assign": "error",
  "no-const-assign": "error",
  "no-constant-condition": "error",
  "no-control-regex": "error",
  "no-debugger": "error",
  "no-delete-var": "error",
  "no-dupe-args": "error",
  "no-dupe-class-members": "error",
  "no-dupe-else-if": "error",
  "no-dupe-keys": "error",
  "no-duplicate-case": "error",
  "no-empty": "error",
  "no-empty-character-class": "error",
  "no-empty-pattern": "error",
  "no-ex-assign": "error",
  "no-extra-boolean-cast": "error",
  "no-extra-semi": "error",
  "no-fallthrough": "error",
  "no-func-assign": "error",
  "no-global-assign": "error",
  "no-import-assign": "error",
  "no-inner-declarations": "error",
  "no-invalid-regexp": "error",
  "no-irregular-whitespace": "error",
  "no-loss-of-precision": "error",
  "no-misleading-character-class": "error",
  "no-mixed-spaces-and-tabs": "error",
  "no-new-symbol": "error",
  "no-nonoctal-decimal-escape": "error",
  "no-obj-calls": "error",
  "no-octal": "error",
  "no-prototype-builtins": "error",
  "no-redeclare": "error",
  "no-regex-spaces": "error",
  "no-self-assign": "error",
  "no-setter-return": "error",
  "no-shadow-restricted-names": "error",
  "no-sparse-arrays": "error",
  "no-this-before-super": "error",
  "no-undef": "error",
  "no-unexpected-multiline": "error",
  "no-unreachable": "error",
  "no-unsafe-finally": "error",
  "no-unsafe-negation": "error",
  "no-unsafe-optional-chaining": "error",
  "no-unused-labels": "error",
  "no-unused-vars": "error",
  "no-useless-backreference": "error",
  "no-useless-catch": "error",
  "no-useless-escape": "error",
  "no-with": "error",
  "require-yield": "error",
  "use-isnan": "error",
  "valid-typeof": "error",
};

const nodeRecommendedRules = {
  "node/handle-callback-err": "error",
  "node/no-path-concat": "error",
  "node/no-process-exit": "error",
};

const starterAppRules = {
  "arrow-parens": "error",
  "arrow-spacing": "error",
  "brace-style": [
    "error",
    "1tbs",
    { allowSingleLine: false },
  ],
  "comma-dangle": [
    "error",
    {
      arrays: "always-multiline",
      objects: "always-multiline",
      imports: "always-multiline",
      exports: "always-multiline",
      functions: "never",
    },
  ],
  "comma-spacing": "error",
  curly: [
    "error",
    "multi-line",
  ],
  "dot-notation": [
    "error",
    { allowKeywords: true },
  ],
  "eol-last": "error",
  eqeqeq: "error",
  "key-spacing": [
    "error",
    {
      beforeColon: false,
      afterColon: true,
    },
  ],
  "keyword-spacing": "error",
  "new-parens": "error",
  "no-alert": "error",
  "no-array-constructor": "error",
  "no-caller": "error",
  "no-catch-shadow": "error",
  "no-eval": "error",
  "no-extend-native": "error",
  "no-extra-bind": "error",
  "no-extra-parens": [
    "error",
    "functions",
  ],
  "no-implied-eval": "error",
  "no-iterator": "error",
  "no-label-var": "error",
  "no-labels": "error",
  "no-lone-blocks": "error",
  "no-loop-func": "error",
  "no-multi-spaces": "error",
  "no-multi-str": "error",
  "no-native-reassign": "error",
  "no-new": "error",
  "no-new-func": "error",
  "no-new-object": "error",
  "no-new-wrappers": "error",
  "no-octal-escape": "error",
  "no-proto": "error",
  "no-return-assign": "error",
  "no-script-url": "error",
  "no-sequences": "error",
  "no-shadow": "error",
  "no-spaced-func": "error",
  "no-trailing-spaces": "error",
  "no-undef-init": "error",
  "no-underscore-dangle": "off",
  "no-unused-expressions": "error",
  "no-use-before-define": [
    "error",
    "nofunc",
  ],
  "no-var": "error",
  "prefer-arrow-callback": "error",
  "prefer-const": [
    "error",
    { destructuring: "all" },
  ],
  quotes: [
    "error",
    "double",
    { avoidEscape: true },
  ],
  semi: [
    "error",
    "always",
  ],
  "semi-spacing": [
    "error",
    {
      before: false,
      after: true,
    },
  ],
  "space-before-blocks": "error",
  "space-before-function-paren": [ "error", {
    anonymous: "always",
    named: "never",
    asyncArrow: "always",
  } ],
  "space-infix-ops": "error",
  "space-unary-ops": [
    "error",
    {
      words: true,
      nonwords: false,
    },
  ],
  "space-in-parens": [ "error", "never" ],
  strict: [
    "error",
    "global",
  ],
  yoda: [
    "error",
    "never",
  ],
};

const importRules = {
  "no-duplicate-imports": "error",
  "import/no-unresolved": "error",
  "import/named": "error",
  "import/namespace": "error",
  "import/order": [ "error", {
    groups: [ [ "builtin", "external" ] ],
    "newlines-between": "always",
  } ],
  "import/extensions": [ "error", "ignorePackages" ],
  "import/default": "error",
  "import/no-dynamic-require": "error",
  "import/no-self-import": "error",
  "import/no-cycle": [ "error", { maxDepth: 2, ignoreExternal: true } ],
  "import/no-useless-path-segments": "error",
  "import/export": "error",
  "import/no-named-as-default": "error",
  "import/no-named-as-default-member": "error",
  "import/no-mutable-exports": "error",
  "import/no-commonjs": "error",
  "import/first": "error",
  "import/no-duplicates": "error",
  "import/newline-after-import": "error",
};

module.exports = function getRules(isModuleProject) {
  return {
    ...eslintRecommendedRules,
    ...nodeRecommendedRules,
    ...starterAppRules,
    ...(isModuleProject ? importRules : {}),
    // good stuff..
    "no-multiple-empty-lines": [ "error", {
      max: 1,
      maxEOF: 0,
      maxBOF: 0,
    } ],
    camelcase: [ "error", { properties: "never" } ],
    "quote-props": [ "error", "as-needed" ],
    "spaced-comment": "error",
    indent: [ "error", 2, { SwitchCase: 1 } ],
    "no-whitespace-before-property": "error",
    "no-console": "error", // was warn in node-starterapp
    "prefer-template": "error", // was warn in node-starterapp
    "no-useless-concat": "error",
    "template-curly-spacing": [ "error", "never" ], // make prefer-template --fix nice
    "linebreak-style": [ "error", "unix" ], // use unix style eol
    "eol-last": [ "error", "always" ], // always eol at the end of a file
    "no-nested-ternary": "error", // unreadable code
    "require-await": "error", // make it explicit
    "object-shorthand": [ "error", "properties" ], // make it short
    "object-curly-spacing": [ "error", "always" ], // consistency
    "array-bracket-spacing": [ "error", "always" ], // consistency with above
    "new-cap": "error", // consistency with test rules
    "switch-colon-spacing": "error",
    // object declarations, either all props on the same line or newline per property
    "object-curly-newline": [ "error", { multiline: true } ],
    "object-property-newline": [ "error", { allowAllPropertiesOnSameLine: true } ],
  };
};
