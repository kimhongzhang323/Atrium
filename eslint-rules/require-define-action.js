/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Exports in src/server/actions/** must be created by defineAction()",
    },
    schema: [],
    messages: {
      mustUseDefineAction:
        "Server Actions in src/server/actions must be defined via defineAction(...). Exported functions here run RLS-unscoped if not wrapped.",
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, "/");
    if (!filename.includes("/src/server/actions/")) return {};

    function isDefineAction(init) {
      return (
        init &&
        init.type === "CallExpression" &&
        init.callee.type === "Identifier" &&
        init.callee.name === "defineAction"
      );
    }

    return {
      // A raw exported `async function foo()` is an unwrapped action — forbidden.
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        if (!decl) return;
        if (decl.type === "FunctionDeclaration") {
          context.report({ node: decl, messageId: "mustUseDefineAction" });
          return;
        }
        if (decl.type === "VariableDeclaration") {
          for (const d of decl.declarations) {
            // Only flag exported *functions*. Schemas (z.object(...)) and other
            // consts may be exported so client forms can share validation.
            const init = d.init;
            const isFn =
              init &&
              (init.type === "ArrowFunctionExpression" ||
                init.type === "FunctionExpression");
            if (isFn && !isDefineAction(init)) {
              context.report({ node: d, messageId: "mustUseDefineAction" });
            }
          }
        }
      },
    };
  },
};
