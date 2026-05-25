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

        // Legacy aliases retained temporarily while components migrate to ht.* tokens.
        primary: "var(--color-action-primary)",
        myblue: "var(--color-accent)",
        borderLight: "var(--color-border-default)",
        darkGrey: "var(--ht-dark)",
        softBlue: "var(--ht-cyan-light)",
        blurpleLight: "var(--ht-purple-light)",
        textColor: "var(--color-text-default)",
        textClor: "var(--color-text-default)",
        customBlue: "rgb(0 180 216 / 0.12)",
        lightGrey: "var(--color-text-muted)",
        slateColor: "#1E293B",
        grayDeep: "var(--color-text-default)", 
        smoke: "#E9ECEF",
        bgColor: "#F9F9F9",
        customActive: "rgb(0 180 216 / 0.12)",
        customActiveText: "var(--color-accent)",
        customActiveBlue: "var(--color-accent)"
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
