import evaluate from 'eval';
import fs from 'fs';
import { inspect } from 'util';

import MemoryFs from 'memory-fs';
import webpack, { Compilation, Compiler, Configuration, Stats } from 'webpack';

const i = (obj: any, depth = 0) => {
  return inspect(obj, false, depth, true);
};

const dump = (config: object, filename = '/tmp/config.json') => {
  fs.writeFileSync(filename, JSON.stringify(config, null, 2));
};

type Webpack = typeof webpack;

type Locals = {
  path: string;
  webpackStats: Stats;
};

type RenderFunction = (locals: Locals) => string;

type StaticSiteWebpackPluginOptions = {
  __filename: string | null;
  paths: string[];
  entry: string;
  globals: object;
  overrideConfig: null | ((ssrConfig: Configuration) => Configuration);
};

module.exports = class StaticSiteWebpackPlugin {
  private static defaultOptions: StaticSiteWebpackPluginOptions = {
    __filename: null,
    paths: ['/'],
    entry: './src/index.ssr.js',
    globals: {},
    overrideConfig: null,
  };

  private options: StaticSiteWebpackPluginOptions;

  constructor(options: StaticSiteWebpackPluginOptions) {
    if (!options.__filename) {
      throw new Error(`StaticSiteWebpackPlugin: __filename must be provided`);
    }

    this.options = {
      ...StaticSiteWebpackPlugin.defaultOptions,
      ...options,
    };
  }

  apply(compiler: Compiler) {
    const pluginName = StaticSiteWebpackPlugin.name;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.optimizeAssets.tapPromise(
        pluginName,
        this.run.bind(this, compiler, compilation),
      );
    });
  }

  private async run(compiler: Compiler, compilation: Compilation) {
    const { webpack } = compiler;
    const { RawSource } = webpack.sources;

    const render = await this.getRenderFunction(webpack, compilation);

    for (const [path, content] of this.renderPages(compilation.getStats(), render)) {
      compilation.assets[path] = new RawSource(content);
    }
  }

  private async getRenderFunction(webpack: Webpack, compilation: Compilation) {
    const ssrEntry = await this.compileSsrBundle(webpack, compilation);

    let render: any = evaluate(ssrEntry, this.options.entry, this.options.globals, true);

    if ('default' in render) {
      render = render.default;
    }

    if (typeof render !== 'function') {
      throw new Error(
        `Export from ${this.options.entry} must be a function returning an HTML string`,
      );
    }

    return render as RenderFunction;
  }

  renderPages(webpackStats: Stats, render: RenderFunction) {
    // console.log(i(webpackStats.assets, 2));

    const { publicPath } = webpackStats.toJson();

    const removeTrailingSlash = (str: string) => {
      return str.replace(/\/$/, '');
    };

    const prependPublicPath = (path: string) => {
      if (publicPath && publicPath !== 'auto') {
        return [removeTrailingSlash(publicPath), path].join('/');
      }

      return path;
    };

    return this.options.paths.map((path) => [
      path.endsWith('.html') ? path : `${removeTrailingSlash(path).replace(/\/$/, '')}/index.html`,
      render({ path: prependPublicPath(path), webpackStats }),
    ]);
  }

  async compileSsrBundle(webpack: Webpack, compilation: Compilation) {
    const compiler = webpack(this.createSsrWebpackConfig(compilation.options as any));
    const fs = new MemoryFs();

    compiler.outputFileSystem = fs;

    return new Promise<string>((resolve, reject) => {
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

  createSsrWebpackConfig(browserWebpackConfig: Configuration) {
    const { entry, overrideConfig } = this.options;
    const clientConfig = require(this.options.__filename!);

    const ssrConfig: Configuration = {
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

    ssrConfig.plugins = ssrConfig.plugins?.filter(
      (plugin) => !(plugin instanceof StaticSiteWebpackPlugin),
    );

    // dump(ssrConfig);

    return overrideConfig ? overrideConfig(ssrConfig) : ssrConfig;
  }
};
