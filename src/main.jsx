import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import './GastosCss/GastosForm.css';
// src/main.jsx


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
