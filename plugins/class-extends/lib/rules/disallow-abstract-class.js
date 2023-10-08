"use strict";

module.exports = {
  meta: {
    docs: {
      description: "Prevent usage of abstract classes.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    function isAbstractClass(node) {
      if (node.type === "ClassDeclaration" && node.abstract === true) {
        return true;
      }
      return false;
    }

    return {
      ClassDeclaration: function (node) {
        if (isAbstractClass(node)) {
          context.report(
            node,
            "Abstract classes aren't allowed."
          );
        }
      },
    };
  },
};
