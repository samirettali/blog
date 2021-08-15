const colors = require("tailwindcss/colors");

// #15181b

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
        "Inter",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "system-ui",
        "Helvetica Neue",
        "Helvetica",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
      mono: ["JetBrains Mono", "Menlo", "Consolas", "Liberation Mono", "monospace"],
    },
    colors: {
      ...colors,
      coolGray: colors.coolGray,
      gray: colors.gray,
      trueGray: colors.trueGray,
    },
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
          }
        }
      }),
      colors: {
        mygray: {
          light: "#f5f5f5",
          DEFAULT: "#1a1b2f",
          secondary: "#333333",
          tertiary: "#242424"
        },
        olive: "#121212",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    // require('@tailwindcss/typography'),
  ],
  mode: 'jit'
};
