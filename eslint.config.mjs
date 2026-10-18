import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // clones de repos y caché del script de /wrapped
    ".data/**",
  ]),
  {
    rules: {
      // El sistema de diseño usa "//" como texto visible (eyebrows, nav).
      // No son comentarios JS — desactivamos el falso positivo.
      "react/jsx-no-comment-textnodes": "off",
      // Los componentes de animación (scroll-reveal, contadores, terminal)
      // setean estado dentro de effects a propósito. Lo dejamos como warning.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
