// frontend/src/components/AuthHandler.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthHandler = () => {
  const location = useLocation(); // Hook para acceder a la URL actual
  const navigate = useNavigate(); // Hook para navegar programáticamente

  useEffect(() => {
    // Obtener el token de los parámetros de la URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      // Si encontramos un token, lo guardamos en localStorage
      localStorage.setItem('jwt_token', token);
      // Luego, redirigimos a la página de podcasts (o el dashboard principal)
      // El 'replace: true' es crucial para que la URL con el token no quede en el historial del navegador
      navigate('/home-podcasts', { replace: true });
    } else {
      // Si no hay token en la URL, es un acceso directo sin login, redirigir a la página de inicio
      console.warn("DEBUG FRONTEND: No se encontró token en la URL de AuthHandler. Redirigiendo a inicio.");
      navigate('/', { replace: true });
    }
  }, [location, navigate]); // Dependencias para que se ejecute cuando la URL o la navegación cambian

  // Este componente no renderiza nada visualmente, solo maneja la lógica de autenticación
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Procesando autenticación...</p>
      <p>Si no eres redirigido automáticamente, revisa la consola para errores o <a href="/">haz clic aquí para volver a la página de inicio</a>.</p>
    </div>
  );
};

export default AuthHandler;