"use strict";

module.exports = {
  meta: {
    docs: {
      description:
        "Prevent extending classes besides React.Component and React.PureComponent.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    return {
      ClassDeclaration: function (node) {
        if (node.superClass) {
          context.report(
            node,
            "Extending other classes via inheritance isn't allowed. Use composition instead."
          );
        }
      },
    };
  },
};
