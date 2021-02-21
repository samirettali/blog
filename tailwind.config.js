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
    colors: {
      ...colors,
      blue: {
        ...colors.blue,
        500: "#1982ff",
        600: "#0070f3",
      },
    },
    extend: {
      colors: {
        mygray: {
          light: "#e4e4e4",
          DEFAULT: "#18191a",
          secondary: "#333333",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
