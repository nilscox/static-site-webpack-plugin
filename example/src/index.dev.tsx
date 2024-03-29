import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter basename={process.env.PUBLIC_PATH}>
    <App />
  </BrowserRouter>,
);
