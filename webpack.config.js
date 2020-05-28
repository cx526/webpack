const { resolve }  = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 从JS中抽取CSS样式插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 压缩CSS
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const commonCssLoader = [
  {
    // 取代style-loader,将原本用style-loader生成插入到页面style标签样式抽离出来成独立的文件
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: '/'
    }
  },
  'css-loader',
  // CSS兼容各大浏览器和添加对应的前缀,需要再package.json中配置规则
  {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      // 方括号不是花括号
      plugins: () => [
        require('postcss-preset-env')()
      ]
    }
  }
]
module.exports = 
  {
    entry: {
      'index': './src/js/index.js',
      'user': './src/js/user.js',
      'font': './src/js/font.js',
      'devServer': './src/js/devServer.js',
      'extract': './src/js/extract.js'
    },
    output: {
      // name取值为entry每一项的键值
      filename: 'js/[name].js',
      path: resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        // css
        {
          test: /\.css$/,
          use: [...commonCssLoader]
        },
        // sass
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            ...commonCssLoader,
            'sass-loader'
          ]
        },
        // 打包除了.html/.css/.js文件结尾的其他文件(主要针对字体图标)
        {
          exclude: /\.(css|js|html|png|jpg|gif|less|scss)$/,
          loader: 'file-loader',
          options: {
            name: '[hash:10].[ext]',
            outputPath: 'static/font'
          }
        },
        // 处理html中的img(采用commonJS规范),与HtmlWebpackPlugin不相兼容，舍弃，html中的img标签引用本地图片时需要<%= require('url') %>引入，网络图片正常引入即可
        // {
        //   test: /\.html$/,
        //   loader: 'html-loader'
        // },
         // url
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
                name: '[hash:10].[ext]',
                outputPath: 'static/images',
                // 不使用html-loader解析.html文件中的img标签是需要开启，页面的图片需要require引入
                esModule: false
              }
            }
          ]
        },
        // ES6 => ES5(基本转换,诸如箭头函数,const,let等)
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            "presets": [
              [
                '@babel/preset-env',
              {
                // 按需做兼容处理加载
                "useBuiltIns": "usage",
                // 指定core-js版本
                "corejs": {
                  version: 3
                },
                // 指定兼容到那个浏览器版本
                "targets": {
                  chrome: '60',
                  firefox: '60',
                  ie: '9',
                  safari: '10',
                  edge: '17' 
                }
              }
              ]
            ]
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'css打包',
        // 指定当前页面需要加载的js文件，值等于entry的键值
        chunks: ['index'],
        // 模板文件
        template: './src/index.html',
        // 输出文件名
        filename: 'index.html',
        // 压缩html
        minify: {
          // 移除空格
          collapseWhitespace: true,
          // 移除注释
          removeComments: true
        }
        
      }),
      new HtmlWebpackPlugin({
        template: './src/user.html',
        filename: 'user.html',
        title: '图片打包',
        chunks: ['user'],
        favicon: './src/images/bird.jpg'
      }),
      new HtmlWebpackPlugin({
        template: './src/font.html',
        filename: 'font.html',
        title: '字体图标打包',
        chunks: ['font']
      }),
      new HtmlWebpackPlugin({
        template: './src/devServer.html',
        filename: 'devServer.html',
        title: '自动打包',
        chunks: ['devServer']
      }),
      new HtmlWebpackPlugin({
        template: './src/extract.html',
        filename: 'extract.html',
        title: 'CSS样式文件提取和兼容处理',
        chunks: ['extract']
      }),
      new MiniCssExtractPlugin({
        // 指定输出到那个目录下
        filename: 'static/css/[name].css'
      }),
      new OptimizeCssAssetsWebpackPlugin()
    ],
    mode: 'development',
    // 启动本地服务器npm webpack-dev-server -D
    devServer: {
      // 指定那个文件夹开启本地服务
      contentBase: resolve(__dirname, 'dist'),
      compress: true,
      port: 9000,
      open: true,
      // 指定从哪个页面打开，默认打开index.html页面，其值默认等于HtmlWebpackPlugin中的filename值
      index: 'user.html'
    }
  }
