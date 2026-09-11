const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Often disabled for Cesium dev due to double render issues
  webpack: (config, { webpack, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: path.resolve(__dirname, 'node_modules/cesium'),
      '@cesium/engine': path.resolve(__dirname, 'node_modules/cesium/node_modules/@cesium/engine'),
      '@cesium/widgets': path.resolve(__dirname, 'node_modules/@cesium/widgets'),
    };
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'node_modules/cesium/Build/CesiumUnminified/Workers'),
              to: '../public/cesium/Workers',
            },
            {
              from: path.join(__dirname, 'node_modules/cesium/Build/CesiumUnminified/ThirdParty'),
              to: '../public/cesium/ThirdParty',
            },
            {
              from: path.join(__dirname, 'node_modules/cesium/Build/CesiumUnminified/Assets'),
              to: '../public/cesium/Assets',
            },
            {
              from: path.join(__dirname, 'node_modules/cesium/Build/CesiumUnminified/Widgets'),
              to: '../public/cesium/Widgets',
            },
          ],
        }),
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('/cesium'),
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
