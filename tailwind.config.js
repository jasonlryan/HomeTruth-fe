// tailwind.config.js

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
        gill: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: "#4A6BFF",
        myblue: '#2960EC',
        borderLight: "#EEEEEE",
        darkGrey: "#343A40",
        softBlue: "#7098FE",
        blurpleLight: "#859BFF",
        textClor: "#333333",
        customBlue: "#E6ECFF",
        lightGrey: "#6C757D",
        slateColor: "#1E293B",
        grayDeep: "#1F1F1F", 
        smoke: "#E9ECEF",
        bgColor: "#F9F9F9",
        customActive: "#19B0F01F",
        customActiveText: "#19B0F0F0",
        customActiveBlue: "#19B0F0"
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
