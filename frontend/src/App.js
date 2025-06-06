// frontend/src/App.js
import React from 'react';
import './App.css'; // Crearemos este archivo después

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>¡Bienvenida a Ambaria!</h1>
        <p>Tu plataforma para conectar y compartir podcasts.</p>
        <a href="http://127.0.0.1:5000/login">
          <button>Iniciar sesión con Google</button>
        </a>
      </header>
    </div>
  );
}

export default App;