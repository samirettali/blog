const withMDX = require("@next/mdx")();

const redirects = async () => {
  return [
    {
      source: "/cv",
      destination: "https://samir-resume.vercel.app",
      permanent: false,
    },
    {
      source: "/instagram",
      destination: "https://instagram.com/samirettali",
      permanent: false,
    },
    {
      source: "/linkedin",
      destination: "https://linkedin.com/in/samirettali",
      permanent: false,
    },
    {
      source: "/photographs",
      destination: "https://500px.com/p/samirettali",
      permanent: false,
    },
    {
      source: "/twitter",
      destination: "https://twitter.com/samirettali",
      permanent: false,
    },
    {
      source: "/github",
      destination: "https://github.com/samirettali",
      permanent: false,
    },
    {
      source: "/mail",
      destination: "mailto:samirettali@protonmail.com",
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
};

module.exports = {
  ...withMDX(),
  redirects,
  rewrites,
  reactStrictMode: true,
};
