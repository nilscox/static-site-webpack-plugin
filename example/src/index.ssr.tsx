import ReactDOMServer from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

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
  webpackStats: {
    compilation: {
      assets: Record<string, unknown>;
    };
  };
};

export default (locals: Locals) => {
  const assets = Object.keys(locals.webpackStats.compilation.assets);
  const bundle = assets.filter((filename) => filename.endsWith('.js'))[0];
  const styles = assets.filter((filename) => filename.endsWith('.css'))[0];

  return (
    '<!DOCTYPE html>' +
    ReactDOMServer.renderToString(
      <MemoryRouter initialEntries={[locals.path]}>
        <Document bundle={'/' + bundle} styles={'/' + styles}>
          <App />
        </Document>
      </MemoryRouter>,
    )
  );
};
