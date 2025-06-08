import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Profile from './components/Profile'; 

function App() {
  return (
       <Router> 
      <div className="App">
        {/* Define tus rutas aquí */}
        <Routes>
          {/* Ruta para la página principal (la de inicio de sesión) */}
          <Route path="/" element={
            <header className="App-header">
              <h1>¡Bienvenida a Ambaria!</h1>
              <p>Tu plataforma para conectar y compartir podcasts.</p>
              {/* El botón de login sigue apuntando al backend, lo cual es correcto para iniciar OAuth */}
              <a href="http://127.0.0.1:5000/login">
                <button>Iniciar sesión con Google</button>
              </a>
            </header>
          } />
          
          {/* Ruta para la página de perfil */}
          <Route path="/profile" element={<Profile />} /> {/* Este componente Profile se cargará en /profile */}
          
          {/* Puedes añadir más rutas aquí en el futuro si las necesitas */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;