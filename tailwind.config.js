const colors = require("tailwindcss/colors");

module.exports = {
  purge: [],
  darkMode: "class",
  theme: {
    fontFamily: {
      serif: ["Roboto Slab", "serif"],
      sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      monospace: [ "SFMono-Regular", "Menlo", "Consolas","Liberation Mono", "monospace" ],
    },
    colors: {
      ...colors,
      gray: colors.warmGray,
    },
    extend: {
      colors: {
        mygray: {
          light: "#e4e4e4",
          DEFAULT: "#222831",
          dark: "#2b2d3e",
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
