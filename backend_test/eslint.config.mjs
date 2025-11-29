/* instalado por npx init
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
*/
//export default defineConfig([
//  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
//  tseslint.configs.recommended,
//]);

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Ignorar archivos que no son parte del proyecto TypeScript
    ignores: [
      "dist/**",
      "node_modules/**", 
      "eslint.config.mjs",  // EXCLUIR archivo de configuración
      "**/*.config.*"       // EXCLUIR todos los archivos de configuración
    ]
  },
  {
    files: ["**/*.{js,ts}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020
      },
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module"
      }
    }
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
      "@typescript-eslint/no-non-null-assertion": "error"  //  Evitar PORT!
    }
  }
);