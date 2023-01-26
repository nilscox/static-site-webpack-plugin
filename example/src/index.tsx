import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';

ReactDOM.hydrate(
  <BrowserRouter basename={process.env.PUBLIC_PATH}>
    <App />
  </BrowserRouter>,
  document.getElementById('root'),
);
