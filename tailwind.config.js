// tailwind.config.js

const brandFont = ['Gill Sans', 'Gill Sans MT', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif'];
const chatFont = ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'];

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: brandFont,
        chat: chatFont,
        sans: brandFont,
        inter: chatFont,
      },
      colors: {
        ht: {
          orange: "var(--ht-orange)",
          "orange-light": "var(--ht-orange-light)",
          cyan: "var(--ht-cyan)",
          "cyan-light": "var(--ht-cyan-light)",
          purple: "var(--ht-purple)",
          "purple-light": "var(--ht-purple-light)",
          green: "var(--ht-green)",
          "green-light": "var(--ht-green-light)",
          black: "var(--ht-black)",
          dark: "var(--ht-dark)",
          grey: "var(--ht-mid-grey)",
          "grey-light": "var(--ht-light-grey)",
          white: "var(--ht-white)",
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
