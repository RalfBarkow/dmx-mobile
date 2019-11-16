const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = (env = {}) => {

  const webpackConfig = {
    entry: './src/main/js/main.js',
    output: {
      path: __dirname + '/src/main/resources/web',
      filename: env.dev ? '[name].js' : '[chunkhash].[name].js'
    },
    resolve: {
      extensions: [".js", ".vue"],
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          loader: [env.dev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          loader: 'file-loader'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/main/resources/index.html',
        favicon:  'src/main/resources/favicon.png'
      }),
      new MiniCssExtractPlugin({
        filename: env.dev ? '[name].css' : '[contenthash].[name].css'
      }),
      new CleanWebpackPlugin(),
      new VueLoaderPlugin()
    ],
    stats: {
      entrypoints: false,
      children: false,
      assetsSort: 'chunks'
    },
    performance: {
      hints: false
    }
  }

  if (env.dev) {
    webpackConfig.devServer = {
      port: 8084,
      proxy: {'/': 'http://localhost:8080'},
      noInfo: true,
      open: true
    }
  }

  return webpackConfig
}
