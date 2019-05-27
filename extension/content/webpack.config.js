const webpack = require('webpack');
const mode = process.env.NODE_ENV || 'development';


module.exports = {
    entry: './extension/content/index.js',
    devtool: 'source-map',
    target: 'web',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            }
        ]
    },
    resolve: {
        modules: ['./node_modules']
    },
    node: {
        fs: 'empty'
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.DefinePlugin({
            ENVIRONMENT: JSON.stringify(mode)
        })
    ],
    mode
};
