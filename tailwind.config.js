const colors = require("tailwindcss/colors");

module.exports = {
  purge: ['./pages/**/*.tsx?', './components/**/*.tsx?', './styles/*.css'],
  darkMode: "class",
  theme: {
    fontFamily: {
      serif: ["Roboto Slab", "serif"],
      sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      mono: [ "Menlo", "Consolas", "Liberation Mono", "monospace" ],
    },
    colors: {
      white: colors.white,
      gray: colors.coolGray,
    },
    extend: {
      colors: {
        mygray: {
          light: "#e4e4e4",
          // DEFAULT: "#222831",
          DEFAULT: "#24292e",
          dark: "#2b2d3e",
          // secondaryDark: "#263238",
          secondaryDark: "#1d2125",
        },
        accent: {
          DEFAULT: "#ef4f4f",
          dark: "#e94560",
        },
      },
    },
  },
  variants: {
    extend: {
    },
  },
  plugins: [
  ],
};
