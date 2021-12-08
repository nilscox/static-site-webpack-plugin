import ReactDOMServer from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Stats } from 'webpack';

import { App } from './App';

type DocumentProps = {
  bundle: string;
  styles: string;
};

const Document: React.FC<DocumentProps> = ({ bundle, styles, children }) => (
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
      <MemoryRouter initialEntries={[path]}>
        <Document bundle={getAssets('js')[0]} styles={getAssets('css')[0]}>
          <App />
        </Document>
      </MemoryRouter>,
    )
  );
};
