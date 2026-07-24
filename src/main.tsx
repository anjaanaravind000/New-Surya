import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import '@/styles.css';

try {
  const savedTheme = localStorage.getItem('new-surya-theme');
  const darkPreferred = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', darkPreferred);
} catch {
  // Use the browser default when storage is unavailable.
}

window.addEventListener('vite:preloadError', () => window.location.reload());
window.addEventListener('unhandledrejection', (event) => {
  const message = event?.reason?.message ?? '';
  if (message.includes('Failed to fetch dynamically imported module') || message.includes('Importing a module script failed')) {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
