const withMDX = require("@next/mdx")();

const rewrites = async () => {
  return [
    {
      source: "/cv",
      destination: "https://samir-resume.vercel.app",
      basePath: false,
    },
  ];
};

module.exports = {
  ...withMDX(),
  rewrites,
  reactStrictMode: true,
};
