const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    stats: 'minimal',
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, './src/index.js'),
        product: path.resolve(__dirname, './src/product.js'),
        cart: path.resolve(__dirname, './src/cart.js'),
        order: path.resolve(__dirname, './src/order.js'),
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[name][ext]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext]'
                }
            },     
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    minimize: true,
                }
            },
            {
                test: /\.css$/i,
                use: [
                    {loader: MiniCssExtractPlugin.loader},
                    {loader: 'css-loader'},
                    {loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: function () {
                                  return [require('autoprefixer')];
                                }
                            }
                        }
                    },
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {loader: MiniCssExtractPlugin.loader},
                    {loader: 'css-loader'},
                    {loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: function () {
                                  return [require('autoprefixer')];
                                }
                            }
                        }
                    },
                    {loader: 'sass-loader'}
                ]
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-proposal-object-rest-spread',
                            '@babel/plugin-transform-runtime'
                        ]
                    }
                }
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            chunks: ['index'],
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/product.html'),
            chunks: ['product'],
            filename: 'product.html'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/cart.html'),
            chunks: ['cart'],
            filename: 'cart.html'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/order.html'),
            chunks: ['order'],
            filename: 'order.html'
        }),
        new MiniCssExtractPlugin({
            filename: 'style.css',
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
        writeToDisk: true,
    },   
};
