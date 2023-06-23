const path = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const PLUGIN_VARS = {
    local: {
        __API_WS_ENDPOINT__: "'ws://localhost:8080/graphql'",
        __API_HTTP_ENDPOINT__: "'http://localhost:8080/graphql'",
        __LOGGING_LEVEL__: "'local'",
    },
    production: {
        __API_WS_ENDPOINT__: "'wss://bananarama-voting-bananza-backend-ddan5fp6ea-ue.a.run.app/graphql'",
        __API_HTTP_ENDPOINT__: "'https://bananarama-voting-bananza-backend-ddan5fp6ea-ue.a.run.app/graphql'",
        __LOGGING_LEVEL__: "'sentry'",
    }
}

const getEnvVariables = () => {
    return PLUGIN_VARS[process.env.NODE_ENV || 'production']
}

const envVariables = getEnvVariables()

const webpackConfig = {
    entry: './src/index.tsx',
    output: {
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        pathinfo: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            experimentalWatchApi: true,
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            sharedComponents: path.resolve(__dirname, 'src/sharedComponents/'),
            theme: path.resolve(__dirname, 'src/theme.tsx'),
            utilities: path.resolve(__dirname, 'src/utilities.ts'),
            types: path.resolve(__dirname, 'src/types.ts'),
            context: path.resolve(__dirname, 'src/Context/'),
            modals: path.resolve(__dirname, 'src/modals/'),
            hooks: path.resolve(__dirname, 'src/hooks/')
        },
    },
    devServer: {
        compress: true,
        port: 3000,
        host: '0.0.0.0',
        hot: true,
        historyApiFallback: true,
    },
    plugins: [
        new webpack.DefinePlugin(envVariables),
        new HtmlWebpackPlugin({
            template: './src/static/index.template.ejs',
            favicon: './src/static/favicon.png',
            inject: 'body',
        }),
    ],
    devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
}

module.exports = webpackConfig
