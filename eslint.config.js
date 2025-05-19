// eslint.config.js
import expoConfig from "eslint-config-expo/flat"
import prettierPlugin from "eslint-plugin-prettier"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: {
      prettier: prettierPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "prettier/prettier": "error",

      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-shadow": "warn",
      "no-multiple-empty-lines": ["warn", { max: 1 }],

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
])
