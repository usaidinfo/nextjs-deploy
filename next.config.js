// next.config.js
const path = require('path');

module.exports = {
  webpack(config) {
    // Add the alias to Webpack
    config.resolve.alias['@components'] = path.join(__dirname, 'src/components');
    return config;
  }
}
