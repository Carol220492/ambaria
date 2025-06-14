import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: '#1a1a40',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0, 255, 255, 0.5)',
      position: 'fixed', // Para que la barra de navegación siempre esté visible
      top: 0,
      width: '100%',
      zIndex: 1000 // Asegura que esté por encima de otros elementos
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
        {/* ¡NUEVO ENLACE AL FORMULARIO DE CONTACTO! */}
        <Link to="/contact" style={{ color: '#E6B3FF', textDecoration: 'none', marginLeft: '30px', fontSize: '1.1em', transition: 'color 0.2s' }}>
          Contacto
        </Link>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#cc00cc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1em',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease'
        }}
      >
        Cerrar Sesión
      </button>
    </nav>
  );
};

export default NavBar;