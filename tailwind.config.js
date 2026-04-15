/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mygray: {
          light: "#f5f5f5",
          DEFAULT: "#1a1b2f",
          secondary: "#333333",
          tertiary: "#242424"
        },
        myblack: "#121212",
      },
      typography: ({ theme }) => ({
        slate: {
          css: {
            color: theme("colors.slate.800"),
            a: {
              color: theme("colors.blue.500"),
              textDecoration: "none",
            },
            "a:hover": {
              color: theme("colors.blue.800"),
            },
            blockquote: {
              color: theme("colors.slate.700"),
              borderLeftColor: theme("colors.slate.300"),
            },
            code: {
              color: theme("colors.slate.800"),
            },
            "pre code": {
              color: "inherit",
            },
          },
        },
      }),
    },
    fontFamily: {
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      mono: ["var(--font-jetbrains-mono)", "monospace"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
