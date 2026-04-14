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
          page: "#f7f8f9",
          surface: "#ffffff",
          subtle: "#f3f4f6",
        },
        text: {
          primary: "#111827",
          secondary: "#374151",
          muted: "#6b7280",
          inverse: "#ffffff",
        },
        border: {
          subtle: "#e5e7eb",
        },
        // Institutional / Brand
        consorci: {
          darkBlue: "#00426b",
          lightBlue: "#4197cb",
          lightGray: "#cfd2d3",
          pinkRed: "#f26178",
          beige: "#e0c5ac",
          yellow: "#f9c311",
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
