A webpack plugin inspired by [static-site-generator-webpack-plugin](https://www.npmjs.com/package/static-site-generator-webpack-plugin) to build static HTML pages with a webpack configuration targeting a node environment.

This plugin takes your webpack config targeting a web environment, and generates a build of your bundle [targeting node](https://webpack.js.org/concepts/targets). It then uses this bundle to render your app's static pages and save them to html files, allowing you to serve them statically.

> ⚠️ this is _not_ a production-ready webpack plugin, it's just a few lines of code I wanted to keep somewhere.

### Why?

Static site generator webpack plugin allows to generate static pages from the same bundle that is output by webpack. As this bundle is supposed to be executed in a browser, it needs to be build using webpack's `web` target. But by doing this, the code being executed server side (by ssgwp) fails, as it expects some browser object to be defined, like window.

<details>
  <summary>Context (expand)</summary>

This happened to me while rendering a site which uses `@emotion/react`, and a solution would be to use webpack's `aliasFields`, as described in [this issue](https://github.com/emotion-js/emotion/issues/1246#issuecomment-601363607). It did help a bit, but then my ssr bundle was depending on standard node packages (such as `stream`), which are not available in the environment the code is evaluated.

But the comment right above on the gitub issue advises to handle this problem with the SSR solution that is used. This is where the idea of a webpack plugin making two builds, one for each environment, came from.

</details>

### How?

This plugins extends your config and changes a few things such as setting the target to `node`, and builds a temporary bundle of your app which is then evaluated and executed. Your entrypoint needs to expose a function that will be called on every path you want to render.

Note that when the plugin invokes this function, it passes the browser's compilation's [stats object](https://webpack.js.org/api/stats), which references paths and hashes of the browser bundle. This allows to reference the assets that will be available in the output directory after the build.

### Example?

Yup, [here](./example).

In short:

```jsx
// src/index.ssr.tsx

type Locals = {
  path: string,
};

export default (locals: Locals) =>
  '<!DOCTYPE html>' +
  ReactDOMServer.renderToString(
    <MemoryRouter initialEntries={[locals.path]}>
      <App />
    </MemoryRouter>,
  );
```

```js
// webpack.config.js

module.exports = {
  // ...

  plugins: [
    new StaticSiteWebpackPlugin({
      __filename,
      entry: './src/index.ssr.tsx',
      paths: ['/', '/blog', '/about.html'],
    }),
  ],
};
```

Output:

```
dist
├── blog
│   └── index.html
├── about.html
├── index.html
└── bundle.js
```

> the "\_\_filename" options is needed because I need to retrieve the base webpack config, and within te plugin I have access to the whole normalized config object. I don't have much knowledge about webpack, so if you've got a better idea, please let me know 🙏
