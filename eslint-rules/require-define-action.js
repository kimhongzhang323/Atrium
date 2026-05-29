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
        "Server Actions in src/server/actions must be defined via defineAction(...)",
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, "/");
    if (!filename.includes("/src/server/actions/")) return {};
    return {
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        if (!decl) return;
        if (decl.type === "VariableDeclaration") {
          for (const d of decl.declarations) {
            if (
              !d.init ||
              d.init.type !== "CallExpression" ||
              d.init.callee.type !== "Identifier" ||
              d.init.callee.name !== "defineAction"
            ) {
              context.report({ node: d, messageId: "mustUseDefineAction" });
            }
          }
          return;
        }
        if (decl.type === "FunctionDeclaration") {
          context.report({ node: decl, messageId: "mustUseDefineAction" });
        }
      },
    };
  },
};
