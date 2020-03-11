process.env.VUE_APP_VERSION = require("./package.json").version;

module.exports = {
  // options...
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",

  // Other options include:
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined
};
