const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development'

  return {
    entry: {
      admin: './assets/js/admin.js',
      shortcuts: './assets/js/shortcuts.js'
    },
    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, 'assets/js')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: [ '>0.25%', 'not dead' ]
                    },
                    modules: false
                  }
                ]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      'postcss-preset-env',
                      {
                        stage: 3,
                        features: {
                          'nesting-rules': true
                        }
                      }
                    ]
                  ]
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '../css/[name].min.css'
      })
    ],
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ]
    },
    performance: {
      hints: false
    },
    stats: {
      colors: true,
      modules: false,
      children: false
    }
  }
}

