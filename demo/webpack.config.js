"use strict";

var path = require("path");
var HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "../src"),
        ],
      },
      {
        test: /\.css$/,
        loader: ["style-loader", "css-loader"],
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "index.html",
    }),
  ],
  resolve: {
    modules: [path.resolve(__dirname, "node_modules")],
  },
};
