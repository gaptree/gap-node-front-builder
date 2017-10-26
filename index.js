'use strict';

const webpack = require('webpack');
const scss = require('gap-node-scss');
const path = require('path');
const UglifyJSPlugin = require('uglify-es-webpack-plugin');

module.exports = (opts) => {
    const baseDir = opts.baseDir || process.cwd(); // eslint-disable-line

    const scssIncludePaths = opts.scss.includePaths || '';
    const scssInputDir = opts.scss.inputDir || 'front/scss';
    const scssOutputDir = opts.scss.outputDir || 'site/static/css/dist';
    const scssOutputStyle = opts.scss.outputStyle || 'nested';
    const scssSourceMap = opts.scss.sourceMap;

    scss({
        includePaths: scssIncludePaths,
        baseDir: baseDir,
        inputDir: scssInputDir,
        outputDir: scssOutputDir,
        outputStyle: scssOutputStyle,
        sourceMap: scssSourceMap
    });


    const jsStaticHost = opts.js.staticHost || '';
    const jsPublicPath = opts.js.publicPath || 'js/dist';
    const jsContextDir = opts.js.contextDir || 'front/js';
    const jsOutputDir = opts.js.outputDir || 'site/static/js/dist';
    const jsModules = opts.js.modules || [
        'node_modules/gap-front-zjs/js',
    ];
    const jsEntry = opts.js.entry || {
        'gap': 'gap.js'
    };
    const jsMinimize = opts.js.minimize === true ? true : false;
    const jsLoaders = opts.js.loaders || [];

    const jsContextRealDir = path.resolve(baseDir, jsContextDir);
    const jsOutputRealDir = path.resolve(baseDir, jsOutputDir);

    const jsOpts = {
        context: jsContextRealDir,
        //devtool: 'source-map',
        output: {
            filename: '[name].js',
            chunkFilename: '[hash]-[id].js',
            path: jsOutputRealDir,
            publicPath: '//' + jsStaticHost + '/' + jsPublicPath + '/'
        },
        entry: jsEntry,
        resolve: {
            modules: jsModules.map((item) => path.resolve(baseDir, item))
        },
        module: {
            loaders: jsLoaders
        },
    };

    if (opts.js.sourceMap) {
        jsOpts.devtool = 'source-map';
    }

    if (jsMinimize) {
        jsOpts.plugins = [
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new UglifyJSPlugin({
                compress: {
                    warnings: false,
                },
                output: {
                    comments: false,
                },
            }),
            new webpack.optimize.AggressiveMergingPlugin()
        ];
    }

    webpack(jsOpts, function (err, stats) {
        if (err) {
            //console.log(err);
            throw err;
        }

        console.log( // eslint-disable-line
            `[webpack:build ${jsOutputRealDir}]`,
            "\n",
            stats.toString({
                chunks: false, // Makes the build much quieter
                colors: true
            })
        );
    });
};

