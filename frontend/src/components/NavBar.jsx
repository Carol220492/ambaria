import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { primaryButtonStyle, dangerButtonStyle } from '../styles/commonStyles.jsx'; 

const NavBar = () => {
  const navigate = useNavigate();
  // Se asume que AuthContext está disponible y tiene 'logout', 'user', 'isAuthenticated'
  const { user, isAuthenticated, logout } = useContext(AuthContext); 


  const handleLogout = () => {
    logout(); // Llama a la función de logout del contexto
    navigate('/');
  };

  return (
    <nav style={{
      // CAMBIO: Fondo semi-transparente para la NavBar
      backgroundColor: 'rgba(26, 26, 50, 0.8)', // Un tono oscuro con 80% de opacidad
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0, 255, 255, 0.5)',
      position: 'fixed', // Para que la barra de navegación siempre esté visible
      top: 0,
      width: '100%',
      zIndex: 1000, // Asegura que esté por encima de otros elementos
      borderRadius: '0 0 10px 10px' // Esquinas redondeadas abajo
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/home-podcasts" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#00FFFF', margin: 0, fontSize: '1.8em', fontWeight: 'bold' }}>Ambaria</h1>
        </Link>
        <Link to="/upload-podcast" style={{ color: '#E6B3FF', textDecoration: 'none', marginLeft: '30px', fontSize: '1.1em', transition: 'color 0.2s' }}>
          Subir Podcast
        </Link>
        <Link to="/profile" style={{ color: '#E6B3FF', textDecoration: 'none', marginLeft: '30px', fontSize: '1.1em', transition: 'color 0.2s' }}>
          Mi Perfil
        </Link>
        {/* Enlace al formulario de contacto */}
        <Link to="/contact" style={{ color: '#E6B3FF', textDecoration: 'none', marginLeft: '30px', fontSize: '1.1em', transition: 'color 0.2s' }}>
          Contacto
        </Link>
      </div>
      {/* Sección de usuario y botón de cerrar sesión */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {isAuthenticated && user ? (
          <>
            <span style={{ color: '#8AFFD2', fontSize: '1em' }}>Hola, {user.name || user.email}!</span>
            {/* ELIMINADA LA IMAGEN DE PERFIL:
            {user.profile_picture && (
              <img
                src={user.profile_picture}
                alt="Profile"
                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            */}
            <button
              onClick={handleLogout}
              // APLICAR: Estilo de botón de peligro
              style={dangerButtonStyle} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          // Enlace de Iniciar Sesión si no está autenticado
          <Link to="/" style={{ ...primaryButtonStyle, textDecoration: 'none', textAlign: 'center', backgroundColor: '#007bff' }}>
            Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
