import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import '@/styles.css';

try {
  const savedTheme = localStorage.getItem('new-surya-theme');
  // Patisserie Noir defaults to dark unless the user has explicitly chosen 'light'.
  const useDark = savedTheme !== 'light';
  document.documentElement.classList.toggle('dark', useDark);
  if (!savedTheme) localStorage.setItem('new-surya-theme', 'dark');
} catch {
  document.documentElement.classList.add('dark');
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
