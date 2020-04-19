module.exports = {
  configureWebpack: (config) => {
    config.output.filename = '[name].js'
    config.output.chunkFilename = '[name].js'
    config.plugins[4].options.filename = '[name].css'
    config.plugins[4].options.chunkFilename = '[name].css'
  }
}
