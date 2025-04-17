import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; 
import App from './App.jsx';

// Obtener el elemento root del DOM
const rootElement = document.getElementById('root');

// Verificar si el elemento root existe
if (rootElement) {
  // Crear la raíz de React
  const root = createRoot(rootElement);

  // Renderizar la aplicación dentro de StrictMode
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // Manejar el caso en que el elemento root no existe
  console.error('No se encontró el elemento con el ID "root".');
}