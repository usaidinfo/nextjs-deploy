// next.config.js
const path = require('path');

module.exports = {
  webpack(config) {
    // Add the alias to Webpack
    config.resolve.alias['@components'] = path.join(__dirname, 'src/components');
    return config;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mygrow-beta.leafai.io']
  }
}

module.exports = nextConfig