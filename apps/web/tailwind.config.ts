import type { Config } from "tailwindcss";
import { THEME } from "../../shared/index.js";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../shared/index.ts",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic Tokens
        background: {
          page: "var(--bg-page)",
          surface: "var(--bg-surface)",
          subtle: "var(--bg-subtle)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        border: {
          subtle: "var(--border-subtle)",
        },
        // Institutional / Brand
        consorci: {
          darkBlue: THEME.colors.primary,
          lightBlue: THEME.colors.secondary,
          actionBlue: THEME.colors.tertiary,
          lightGray: THEME.colors.gray,
          pinkRed: THEME.colors.accent,
          beige: THEME.colors.beige,
          yellow: THEME.colors.yellow,
          bgGray: THEME.colors.bgGray,
          secondaryBg: THEME.colors.secondaryBg,
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
