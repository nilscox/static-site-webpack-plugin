const MemoryFs = require('memory-fs');
const evaluate = require('eval');
const fs = require('fs');

module.exports = class StaticSiteWebpackPlugin {
  static defaultOptions = {
    __filename: null,
    paths: ['/'],
    entry: './src/index.ssr.js',
    globals: {},
    overrideConfig: null,
  };

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

    compiler.hooks.thisCompilation.tap(pluginName, (compilation, p) => {
      compilation.hooks.optimizeAssets.tapPromise(
        pluginName,
        this.run.bind(this, compiler, compilation),
      );
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

    let render = evaluate(ssrEntry, this.options.entry, this.options.globals, true);

    if ('default' in render) {
      render = render.default;
    }

    if (typeof render !== 'function') {
      throw new Error(
        `Export from ${this.options.entry} must be a function returning an HTML string`,
      );
    }

    return render;
  }

  renderPages(webpackStats, render) {
    return this.options.paths.map((path) => [
      path.endsWith('.html') ? path : `${path}/index.html`,
      render({ path, webpackStats }),
    ]);
  }

  async compileSsrBundle(webpack, compilation) {
    const compiler = webpack(this.createSsrWebpackConfig(compilation.options));
    const fs = new MemoryFs();

    compiler.outputFileSystem = fs;

    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }

        if (stats.hasErrors()) {
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

    ssrConfig.plugins = ssrConfig.plugins.filter(
      (plugin) => !(plugin instanceof StaticSiteWebpackPlugin),
    );

    // this.dumpConfig(JSON.stringify(ssrConfig, null, 2));

    return overrideConfig ? overrideConfig(ssrConfig) : ssrConfig;
  }

  dump(config, filename = '/tmp/config.json') {
    fs.writeFileSync(filename, config);
  }
};
