// frontend/src/components/Home.js
import React from 'react';

const Home = () => {
  // Función para iniciar el flujo de login con Google
  const handleLogin = () => {
    // Redirige al usuario a la ruta /login de tu backend Flask
    window.location.href = process.env.REACT_APP_API_URL 
      ? `${process.env.REACT_APP_API_URL}/login` 
      : 'http://localhost:5000/login';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Bienvenido a Ambaria</h1>
      <p>Tu plataforma para explorar y compartir podcasts.</p>
      <p>Por favor, inicia sesión para acceder a tu contenido.</p>
      <button 
        onClick={handleLogin} 
        style={{ 
          backgroundColor: '#4285F4', // Color de Google
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer', 
          fontSize: '16px' 
        }}
      >
        Iniciar Sesión con Google
      </button>
    </div>
  );
};

export default Home;