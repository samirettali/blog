/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/cv",
        destination: "/api/link/cv",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
