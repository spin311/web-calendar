const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/script.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader"


      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 3001,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  }
};