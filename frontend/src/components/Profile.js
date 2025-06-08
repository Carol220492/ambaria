// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importaciones cruciales para la navegación

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // Hook para acceder a la URL actual
  const navigate = useNavigate(); // Hook para navegar programáticamente

  useEffect(() => {
    let token = localStorage.getItem('jwt_token'); // 1. Intentar obtener el token del almacenamiento local

    // 2. Verificar si hay un token en la URL (esto ocurre justo después del login de Google)
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token'); // Obtener el token del parámetro 'token' en la URL

    if (tokenFromUrl) {
      token = tokenFromUrl; // Usar el token que viene en la URL
      localStorage.setItem('jwt_token', tokenFromUrl); // Guardar el token en localStorage para futuras peticiones
      
      // Opcional: Limpiar el token de la URL para que no quede expuesto en el historial/barra
      // Reemplazamos la entrada del historial para quitar el token sin recargar
      navigate('/profile', { replace: true }); 
    }

    // 3. Si no tenemos un token (ni del localStorage ni de la URL), mostramos error y salimos
    if (!token) {
      setError("No hay token de autenticación. Por favor, inicia sesión.");
      setLoading(false);
      return; // Detiene la ejecución del useEffect aquí
    }

    const fetchProfileData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        // Hacemos una solicitud al endpoint /profile de tu backend
        // *** CAMBIO CRÍTICO: AÑADIR CABECERA DE AUTORIZACIÓN PARA JWT ***
        const response = await fetch(`${API_URL}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` // <--- ¡ESTA ES LA LÍNEA MÁS IMPORTANTE PARA JWT!
          },
          // ¡IMPORTANTE! Ya NO necesitamos 'credentials: 'include'' si el token va en la cabecera.
          // Esto evita posibles conflictos o confusión con la gestión de sesiones/cookies.
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Intenta parsear JSON de error
          if (response.status === 401) {
            setError(`No estás autenticado. Por favor, inicia sesión. (${errorData.message || response.statusText})`);
            // Si el token expira o es inválido, forzar logout y redirigir
            localStorage.removeItem('jwt_token');
            navigate('/'); // Redirige a la página de inicio
          } else if (response.status === 422) { // Manejar el 422 de Flask-JWT-Extended más específicamente
            setError(`Error de procesamiento (JWT): ${errorData.message || response.statusText}`);
          }
          else {
            setError(`Error al cargar los datos del perfil: ${response.statusText || 'Error desconocido'}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching profile:", err); // Mantener este para errores de red/fetch
        setError("No se pudo conectar con el servidor o cargar el perfil.");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [location.search, navigate]); // Las dependencias aseguran que useEffect se re-ejecute si la URL o la navegación cambian

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {error}
        {/* Si el error es por token expirado/autenticación, dar opción de ir a login */}
        {(error.includes("expirado") || error.includes("autenticado")) && (
          <button onClick={() => navigate('/')}>Ir a Iniciar Sesión</button>
        )}
      </div>
    );
  }

  if (!userData) {
      return <div>No se encontraron datos de usuario.</div>;
  }

  return (
    <div>
      <h1>Página de Perfil</h1>
      {userData.profile_picture && (
        <img src={userData.profile_picture} alt="Foto de Perfil" style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
      )}
      <p>{userData.message}</p>
      <p>ID de Usuario: {userData.user_id}</p>
      <p>Email: {userData.email}</p>
      {/* Botón de Logout para eliminar el token del frontend */}
      <button onClick={() => {
        localStorage.removeItem('jwt_token'); // Elimina el token del almacenamiento local
        navigate('/'); // Redirige a la página de inicio de sesión
      }}>Cerrar Sesión</button>
    </div>
  );
};

export default Profile;