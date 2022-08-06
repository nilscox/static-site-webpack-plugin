import { createMemoryHistory } from 'history';
import ReactDOMServer from 'react-dom/server';
import { Router } from 'react-router-dom';
import { Stats } from 'webpack';

import { App } from './App';

type DocumentProps = {
  bundle: string;
  styles: string;
  children: React.ReactNode;
};

const Document = ({ bundle, styles, children }: DocumentProps) => (
  <html>
    <head>
      <title>StaticSiteWebpackPlugin</title>
      <link rel="stylesheet" href={styles} />
    </head>
    <body>
      <div id="root">{children}</div>
      <script src={bundle} />
    </body>
  </html>
);

type Locals = {
  path: string;
  webpackStats: Stats;
};

export default ({ path, webpackStats }: Locals) => {
  const assets = Object.keys(webpackStats.compilation.assets);
  const publicPath = webpackStats.toJson().publicPath ?? '';

  const getAssets = (ext: string) => {
    return assets
      .filter((filename) => filename.endsWith(`.${ext}`))
      .map((asset) => [publicPath.replace(/\/$/, ''), asset].join('/'));
  };

  return (
    '<!DOCTYPE html>' +
    ReactDOMServer.renderToString(
      <Router location={path} navigator={createMemoryHistory()}>
        <Document bundle={getAssets('js')[0]} styles={getAssets('css')[0]}>
          <App />
        </Document>
      </Router>,
    )
  );
};
