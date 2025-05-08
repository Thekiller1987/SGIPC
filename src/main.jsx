import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './GastosCss/GastosForm.css';

// Montar la app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ✅ Registrar Service Worker para PWA (esto va después del render)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('✅ Service Worker registrado:', reg))
      .catch(err => console.error('❌ Error al registrar el Service Worker:', err));
  });
}
