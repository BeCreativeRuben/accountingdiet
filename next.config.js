/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SECRET_TOKEN: process.env.SECRET_TOKEN,
  },
}

module.exports = nextConfig
