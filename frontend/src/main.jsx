// frontend/src/main.jsx (o .js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; 
// import './index.css'; // Si tienes un archivo CSS global, asegúrate de que la ruta sea correcta.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);