// frontend/src/components/NavBar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();

  const isAuthenticated = () => {
    return localStorage.getItem('jwt_token') !== null;
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token'); // Elimina el token del almacenamiento local
    navigate('/', { replace: true }); // Redirige al usuario a la página de inicio (login)
  };

  return (
    <nav style={{ background: '#333', padding: '10px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        {isAuthenticated() && (
          <>
            <Link to="/home-podcasts" style={{ color: 'white', textDecoration: 'none' }}>Inicio Podcasts</Link>
            <Link to="/upload-podcast" style={{ color: 'white', textDecoration: 'none' }}>Subir Podcast</Link> {/* <-- ¡NUEVO ENLACE! */}
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Mi Perfil</Link>
          </>
        )}
      </div>
      <div>
        <button onClick={handleLogout} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default NavBar;