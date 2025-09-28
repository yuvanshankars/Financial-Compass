const { override, addWebpackPlugin } = require('customize-cra');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config, env) {
  // Add fallbacks for node core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "vm": require.resolve("vm-browserify"),
    "os": require.resolve("os-browserify/browser")
  };

  // Add the NodePolyfillPlugin
  config.plugins.push(new NodePolyfillPlugin());

  // Ignore source map warnings
  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
};