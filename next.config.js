const withMDX = require("@next/mdx")();

const redirects = async () => {
  return [
    {
      source: "/cv",
      destination: "https://samir-resume.vercel.app",
      permanent: false,
    },
  ];
};


const rewrites = async () => {
  return [
    {
      source: '/bear.js',
      destination: 'https://cdn.panelbear.com/analytics.js',
    },
  ];
},

module.exports = {
  ...withMDX(),
  redirects,
  rewrites,
  reactStrictMode: true,
};
