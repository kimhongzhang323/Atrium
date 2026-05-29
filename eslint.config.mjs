import { createRequire } from "node:module";
import requireDefineAction from "./eslint-rules/require-define-action.js";

const require = createRequire(import.meta.url);
const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["src/server/actions/**/*.ts"],
    plugins: {
      local: { rules: { "require-define-action": requireDefineAction } },
    },
    rules: { "local/require-define-action": "error" },
  },
];
