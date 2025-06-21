import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { primaryButtonStyle, dangerButtonStyle } from '../styles/commonStyles.jsx'; 
// NO IMPORTAMOS NavBar.css

const NavBar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Detecta si es móvil al inicio

  // useEffect para detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      if (!newIsMobile && isMenuOpen) { // Si la pantalla es grande y el menú estaba abierto, ciérralo
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Limpiar el event listener cuando el componente se desmonte
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]); // Dependencia en isMenuOpen para reevaluar cuando se cierra manualmente

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      style={{
        backgroundColor: 'rgba(26, 26, 50, 0.9)', 
        padding: isMobile ? '10px 15px' : '15px 30px', // Padding responsivo
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0, 255, 255, 0.5)',
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', // Usamos 100vw para asegurar que ocupe todo el ancho de la ventana
        zIndex: 1000, 
        borderRadius: '0 0 10px 10px', 
        boxSizing: 'border-box', // Importante para que el padding no añada ancho extra
        transition: 'background-color 0.3s ease' 
      }}
    >
      {/* Sección izquierda: Título Ambaria */}
      <Link to="/home-podcasts" style={{ textDecoration: 'none' }}>
        <h1 
          style={{ 
            color: '#00FFFF', 
            margin: 0, 
            fontSize: isMobile ? '1.5em' : '1.8em', // Tamaño responsivo del título
            fontWeight: 'bold' 
          }}
        >
          Ambaria
        </h1>
      </Link>

      {/* Botón de Hamburguesa (visible solo en móvil) */}
      {isMobile && (
        <button 
          onClick={toggleMenu} 
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          style={{
            background: 'none',
            border: 'none',
            color: '#00FFFF',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 1001, 
          }}
        >
          <svg viewBox="0 0 24 24" width={isMobile ? '28' : '24'} height={isMobile ? '28' : '24'} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {isMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      )}

      {/* Contenedor del menú: Visibilidad y diseño responsivo con estilos inline */}
      <div 
        style={{
          display: isMobile ? (isMenuOpen ? 'flex' : 'none') : 'flex', // Mostrar/ocultar y flex para desktop
          flexDirection: isMobile ? 'column' : 'row', // Columna en móvil, fila en desktop
          position: isMobile ? 'fixed' : 'static', // Fijo en móvil, estático en desktop
          top: isMobile ? '0' : 'auto', 
          right: isMobile ? '0' : 'auto', // Pegado a la derecha en móvil
          width: isMobile ? '70vw' : 'auto', // Ancho del menú lateral en móvil (70% del viewport width)
          height: isMobile ? '100vh' : 'auto', // Altura completa en móvil
          backgroundColor: isMobile ? 'rgba(26, 26, 50, 0.98)' : 'transparent', // Fondo más opaco en móvil
          padding: isMobile ? '80px 20px 20px 20px' : '0', // Padding responsivo
          boxShadow: isMobile ? '-5px 0 15px rgba(0, 255, 255, 0.5)' : 'none', // Sombra en móvil
          transform: isMobile ? (isMenuOpen ? 'translateX(0)' : 'translateX(100%)') : 'translateX(0)', // Animación deslizante
          transition: 'transform 0.3s ease-out, background-color 0.3s ease, padding 0.3s ease', // Transiciones
          zIndex: isMobile ? 999 : 'auto', // Z-index para el menú lateral
          alignItems: isMobile ? 'center' : 'center', // Centrar elementos en móvil, centrar en fila en desktop
          justifyContent: isMobile ? 'flex-start' : 'space-between', // Alineación en móvil/desktop
          marginLeft: isMobile ? '0' : 'auto', // Margen en desktop (para empujar a la derecha)
          flexGrow: isMobile ? '0' : '1', // Ocupar espacio en desktop
        }}
      >
        {/* Contenedor de enlaces de navegación */}
        {/* CAMBIO CLAVE AQUÍ: marginLeft condicional */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            gap: isMobile ? '20px' : '30px', 
            alignItems: 'center', 
            width: isMobile ? '100%' : 'auto', 
            marginBottom: isMobile ? '30px' : '0', 
            marginLeft: isMobile ? '0' : '40px', // <-- ¡AQUÍ EL MARGEN! Solo en desktop
          }}
        >
          <Link 
            to="/upload-podcast" 
            onClick={() => setIsMenuOpen(false)} 
            style={{ 
              color: '#E6B3FF', 
              textDecoration: 'none', 
              fontSize: isMobile ? '1.2em' : '1.1em', 
              transition: 'color 0.2s',
              padding: isMobile ? '10px 0' : '0', 
              width: isMobile ? '100%' : 'auto', 
              textAlign: 'center', 
            }}
          >
            Subir Podcast
          </Link>
          <Link 
            to="/profile" 
            onClick={() => setIsMenuOpen(false)} 
            style={{ 
              color: '#E6B3FF', 
              textDecoration: 'none', 
              fontSize: isMobile ? '1.2em' : '1.1em', 
              transition: 'color 0.2s',
              padding: isMobile ? '10px 0' : '0', 
              width: isMobile ? '100%' : 'auto', 
              textAlign: 'center',
            }}
          >
            Mi Perfil
          </Link>
          <Link 
            to="/contact" 
            onClick={() => setIsMenuOpen(false)} 
            style={{ 
              color: '#E6B3FF', 
              textDecoration: 'none', 
              fontSize: isMobile ? '1.2em' : '1.1em', 
              transition: 'color 0.2s',
              padding: isMobile ? '10px 0' : '0', 
              width: isMobile ? '100%' : 'auto', 
              textAlign: 'center',
            }}
          >
            Contacto
          </Link>
        </div>

        {/* Sección de usuario y botón de cerrar sesión */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            alignItems: 'center', 
            gap: '15px', 
            width: isMobile ? '100%' : 'auto', 
          }}
        >
          {isAuthenticated && user ? (
            <>
              <span 
                style={{ 
                  color: '#8AFFD2', 
                  fontSize: isMobile ? '1.1em' : '1em', 
                  whiteSpace: 'nowrap',
                  padding: isMobile ? '10px 0' : '0', 
                  width: isMobile ? '100%' : 'auto', 
                  textAlign: 'center',
                }}
              >
                Hola, {user.name || user.email}!
              </span>
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                style={{ 
                  ...dangerButtonStyle,
                  padding: isMobile ? '8px 16px' : dangerButtonStyle.padding, 
                  fontSize: isMobile ? '0.9em' : dangerButtonStyle.fontSize, 
                  maxWidth: isMobile ? '200px' : 'auto', 
                  margin: isMobile ? '0 auto' : '0', 
                }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)} 
              style={{ 
                ...primaryButtonStyle, 
                textDecoration: 'none', 
                textAlign: 'center', 
                backgroundColor: '#007bff',
                padding: isMobile ? '8px 16px' : primaryButtonStyle.padding, 
                fontSize: isMobile ? '0.9em' : primaryButtonStyle.fontSize, 
                maxWidth: isMobile ? '200px' : 'auto', 
                margin: isMobile ? '0 auto' : '0', 
              }}
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;