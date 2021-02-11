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

module.exports = {
  ...withMDX(),
  redirects,
  reactStrictMode: true,
};
