/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["via.placeholder.com"], // Add the domain for external images
  },
};

module.exports = nextConfig;
