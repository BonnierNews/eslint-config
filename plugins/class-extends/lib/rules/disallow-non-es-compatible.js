"use strict";

module.exports = {
  meta: {
    docs: {
      description:
        "Prevent usage of non EcmaScript compatible functionality when using Typescript.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    return {
      PropertyDefinition: function (node) {
        if (node.accessibility !== "private") {
          return;
        }
        context.report(
          node,
          "Private keyword isn't allowed, use native # instead."
        );
      },

      MethodDefinition: function (node) {
        if (node.decorators.length === 0) {
          return;
        }
        context.report(node, "Decorators aren't allowed.");
      },

      TSEnumDeclaration: function (node) {
        context.report(
          node,
          "Don't use enums since it is not a type-level extension of JavaScript. Use Objects instead."
        );
      },
    };
  },
};
