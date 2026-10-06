import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/sidepanel/App';
import '@/index.css';

document.documentElement.classList.add('acrossicon-web');
document.body.classList.add('acrossicon-web');

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App runtime="web" />
  </StrictMode>,
);
