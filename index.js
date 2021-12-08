"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eval_1 = __importDefault(require("eval"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const memory_fs_1 = __importDefault(require("memory-fs"));
const i = (obj, depth = 0) => {
    return (0, util_1.inspect)(obj, false, depth, true);
};
const dump = (config, filename = '/tmp/config.json') => {
    fs_1.default.writeFileSync(filename, JSON.stringify(config, null, 2));
};
module.exports = class StaticSiteWebpackPlugin {
    static defaultOptions = {
        __filename: null,
        paths: ['/'],
        entry: './src/index.ssr.js',
        globals: {},
        overrideConfig: null,
    };
    options;
    constructor(options) {
        if (!options.__filename) {
            throw new Error(`StaticSiteWebpackPlugin: __filename must be provided`);
        }
        this.options = {
            ...StaticSiteWebpackPlugin.defaultOptions,
            ...options,
        };
    }
    apply(compiler) {
        const pluginName = StaticSiteWebpackPlugin.name;
        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.hooks.optimizeAssets.tapPromise(pluginName, this.run.bind(this, compiler, compilation));
        });
    }
    async run(compiler, compilation) {
        const { webpack } = compiler;
        const { RawSource } = webpack.sources;
        const render = await this.getRenderFunction(webpack, compilation);
        for (const [path, content] of this.renderPages(compilation.getStats(), render)) {
            compilation.assets[path] = new RawSource(content);
        }
    }
    async getRenderFunction(webpack, compilation) {
        const ssrEntry = await this.compileSsrBundle(webpack, compilation);
        let render = (0, eval_1.default)(ssrEntry, this.options.entry, this.options.globals, true);
        if ('default' in render) {
            render = render.default;
        }
        if (typeof render !== 'function') {
            throw new Error(`Export from ${this.options.entry} must be a function returning an HTML string`);
        }
        return render;
    }
    renderPages(webpackStats, render) {
        // console.log(i(webpackStats.assets, 2));
        return this.options.paths.map((path) => [
            path.endsWith('.html') ? path : `${path.replace(/\/$/, '')}/index.html`,
            render({ path, webpackStats }),
        ]);
    }
    async compileSsrBundle(webpack, compilation) {
        const compiler = webpack(this.createSsrWebpackConfig(compilation.options));
        const fs = new memory_fs_1.default();
        compiler.outputFileSystem = fs;
        return new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                if (err) {
                    return reject(err);
                }
                if (stats?.hasErrors()) {
                    const message = stats.toString({
                        errorDetails: true,
                        warnings: true,
                    });
                    return reject(new Error(message));
                }
                resolve(fs.data.dist['bundle.js'].toString());
            });
        });
    }
    createSsrWebpackConfig(browserWebpackConfig) {
        const { entry, overrideConfig } = this.options;
        const clientConfig = require(this.options.__filename);
        const ssrConfig = {
            // ...browserWebpackConfig,
            ...clientConfig,
            target: 'node',
            entry,
            output: {
                ...clientConfig.output,
                path: '/dist',
                filename: 'bundle.js',
                libraryTarget: 'commonjs',
            },
        };
        ssrConfig.plugins = ssrConfig.plugins?.filter((plugin) => !(plugin instanceof StaticSiteWebpackPlugin));
        // dump(ssrConfig);
        return overrideConfig ? overrideConfig(ssrConfig) : ssrConfig;
    }
};
