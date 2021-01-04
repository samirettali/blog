const { colors } = require("tailwindcss/defaultTheme");
// console.log(colors);

module.exports = {
  purge: [],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        // 'accent-dark': 'var(--accent-dark)',
        'accent-dark': '#ff0000',
        'black-light': '#141516'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
