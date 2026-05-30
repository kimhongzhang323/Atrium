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
        "Server Actions in src/server/actions must be defined via defineAction(...). Files here carry \"use server\", so every export must be an async action — put schemas and other values in a colocated *.schema.ts.",
    },
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(/\\/g, "/");
    if (!filename.includes("/src/server/actions/")) return {};
    // Schemas live in colocated `*.schema.ts` files (plain modules, not "use server"),
    // so client forms can share validation. Those files are exempt.
    if (filename.endsWith(".schema.ts")) return {};

    function isDefineAction(init) {
      return (
        init &&
        init.type === "CallExpression" &&
        init.callee.type === "Identifier" &&
        init.callee.name === "defineAction"
      );
    }

    return {
      ExportNamedDeclaration(node) {
        const decl = node.declaration;
        // Type-only exports (`export type`, `export interface`) are erased at
        // build and don't violate the "use server" async-only export rule.
        if (!decl) return;
        if (decl.type === "FunctionDeclaration") {
          context.report({ node: decl, messageId: "mustUseDefineAction" });
          return;
        }
        if (decl.type === "VariableDeclaration") {
          for (const d of decl.declarations) {
            // In a "use server" file, exporting anything other than a defineAction
            // wrapper breaks `next build` (only async functions may be exported).
            if (!isDefineAction(d.init)) {
              context.report({ node: d, messageId: "mustUseDefineAction" });
            }
          }
        }
      },
    };
  },
};
