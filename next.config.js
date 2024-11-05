/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true,
    compiler: {
      styledComponents: true,
    },
    experimental: {
      forceSwcTransforms: true,
    },
  }
  
  module.exports = nextConfig