// frontend/src/components/Home.js
import React from 'react';
// Eliminamos la importación de useNavigate ya que no se utiliza
// import { useNavigate } from 'react-router-dom';

const Home = () => {
  // Eliminamos la declaración de navigate ya que no se utiliza
  // const navigate = useNavigate();

  // Función para iniciar el flujo de login con Google
  const handleGoogleLogin = () => {
    // Redirige al usuario a la ruta /auth/google de tu backend Flask
    window.location.href = process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL}/auth/google`
      : 'http://localhost:5000/auth/google';
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px',
                  backgroundColor: '#1a1a32', minHeight: '100vh',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: '#2a2a4a', padding: '40px',
                    borderRadius: '10px', boxShadow: '0 0 20px rgba(0, 255, 255, 0.7)',
                    maxWidth: '400px', width: '90%' }}>
        <h1 style={{ color: '#00FFFF', marginBottom: '20px' }}>Bienvenido a Ambaria</h1>
        <p style={{ fontSize: '1.1em', marginBottom: '30px' }}>Tu plataforma para explorar y compartir podcasts.</p>

        <button
          onClick={handleGoogleLogin}
          style={{
            backgroundColor: '#cc00cc',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2em',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e600e6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#cc00cc'}
        >
          <img
            src="https://img.icons8.com/color/48/000000/google-logo.png"
            alt="Google logo"
            style={{ width: '24px', height: '24px' }}
          />
          Iniciar Sesión con Google
        </button>

        <p style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9em' }}>
          Al iniciar sesión, aceptas nuestros <a href="/terms" style={{ color: '#00FFFF', textDecoration: 'none' }}>Términos de Servicio</a> y <a href="/privacy" style={{ color: '#00FFFF', textDecoration: 'none' }}>Política de Privacidad</a>.
        </p>
      </div>
    </div>
  );
};

export default Home;