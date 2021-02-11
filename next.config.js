const withMDX = require("@next/mdx")();

const rewrites = async () => {
  return [
    {
      source: "/cv",
      destination: "https://samir-resume.vercel.app",
    },
  ];
};

module.exports = {
  ...withMDX(),
  rewrites,
};
