/** @type {import('tailwindcss').Config} */

// Simulating import from shared/theme to avoid build issues in JS config
const THEME = {
  colors: {
    primary: '#00426B',
    secondary: '#4197CB',
    tertiary: '#0775AB',
    accent: '#F26178',
    beige: '#E0C5AC',
    yellow: '#F9C311',
    gray: '#CFD2D3',
    bgGray: '#F2F2F3',
    secondaryBg: '#EAEFF2',
  }
};

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
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
          darkBlue: "var(--consorci-dark-blue)",
          lightBlue: "var(--consorci-light-blue)",
          lightGray: "var(--consorci-light-gray)",
          pinkRed: "var(--consorci-pink-red)",
          beige: "var(--consorci-beige)",
          yellow: "var(--consorci-yellow)",
        },
        primary: {
          DEFAULT: "var(--consorci-dark-blue)", 
        },
        secondary: {
          DEFAULT: "var(--consorci-light-blue)",
        },
        accent: {
          DEFAULT: "var(--consorci-pink-red)",
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
