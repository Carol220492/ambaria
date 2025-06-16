// frontend/src/components/Home.js
import React from 'react';
import { /* useNavigate, */ Link } from 'react-router-dom'; // Eliminamos useNavigate de la importación
import { pageContainerStyle, primaryButtonStyle } from '../styles/commonStyles';

const Home = () => {
    // const navigate = useNavigate(); // Ya no es necesario si no se usa para navegación programática

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <div style={{ ...pageContainerStyle, justifyContent: 'center' }}>
            <h1 style={{ color: '#00FFFF', fontSize: '3em', marginBottom: '20px' }}>Bienvenido a Ambaria</h1>
            <p style={{ fontSize: '1.1em', marginBottom: '30px' }}>Tu plataforma para explorar y compartir podcasts.</p>

            <button
                onClick={handleGoogleLogin}
                style={{
                    ...primaryButtonStyle,
                    backgroundColor: '#cc00cc',
                    padding: '15px 30px',
                    fontSize: '1.2em',
                    fontWeight: 'bold',
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

            {/* El Link a /contact sí se usa, así que lo mantenemos */}
            <p style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9em' }}>
              Al iniciar sesión, aceptas nuestros <a href="/terms" style={{ color: '#00FFFF', textDecoration: 'none' }}>Términos de Servicio</a> y <a href="/privacy" style={{ color: '#00FFFF', textDecoration: 'none' }}>Política de Privacidad</a>.
            </p>
            {/* Si quieres que el enlace a /contact sea un Link de React Router, es correcto así */}
            <Link to="/contact" style={{ color: '#00FFFF', textDecoration: 'none', marginTop: '10px', display: 'block' }}>Contacto</Link>
        </div>
    );
};

export default Home;