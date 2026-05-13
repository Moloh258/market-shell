// @ts-check

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig(
  {
    ignores: ["dist", "build", "node_modules"],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
