const colors = require("tailwindcss/colors");

module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: [
      "./pages/**/*.js",
      "./pages/**/*.ts",
      "./pages/**/*.jsx",
      "./pages/**/*.tsx",
      "./components/**/*.js",
      "./components/**/*.ts",
      "./components/**/*.jsx",
      "./components/**/*.tsx",
      "./styles/**/*.css",
    ],
  },
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
      mono: ["Menlo", "Consolas", "Liberation Mono", "monospace"],
    },
    colors: colors,
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
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
