import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BakeryStoreProvider } from './state/BakeryStore';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BakeryStoreProvider>
        <App />
      </BakeryStoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
