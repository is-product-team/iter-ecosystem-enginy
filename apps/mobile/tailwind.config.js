const path = require('path');

module.exports = {
  content: [
    path.join(__dirname, "./app/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "./components/**/*.{js,jsx,ts,tsx}"),
    path.join(__dirname, "./App.{js,jsx,ts,tsx}"),
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic Tokens
        background: {
          page: "var(--bg-page)",
          surface: "var(--bg-surface)",
          subtle: "var(--bg-subtle)",
          brand: "var(--bg-brand)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
          brand: "var(--text-brand)",
        },
        border: {
          subtle: "var(--border-subtle)",
          focus: "var(--border-focus)",
        },
        // Institutional / Brand
        consorci: {
          darkBlue: "var(--consorci-dark-blue)",
          lightBlue: "var(--consorci-light-blue)",
          actionBlue: "var(--consorci-action-blue)",
          lightGray: "var(--consorci-light-gray)",
          pinkRed: "var(--consorci-pink-red)",
          beige: "var(--consorci-beige)",
          yellow: "var(--consorci-yellow)",
        },
        primary: {
          DEFAULT: "#00426b", 
        },
        secondary: {
          DEFAULT: "#4197cb",
        },
        accent: {
          DEFAULT: "#f26178",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
        corporate: ['Inter', 'sans-serif'], 
      },
      fontSize: {
        'xs': '14px',
        'sm': '16px',
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '30px',
        '3xl': '36px',
      },
    },
  },
  plugins: [],
};
