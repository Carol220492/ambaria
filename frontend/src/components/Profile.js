// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Solo necesitamos useNavigate para redirigir en caso de error

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para navegar programáticamente

  useEffect(() => {
    const token = localStorage.getItem('jwt_token'); // Obtiene el token del localStorage

    if (!token) {
      // Si no hay token en localStorage, el usuario no está autenticado
      setError("No hay token de autenticación. Por favor, inicia sesión.");
      setLoading(false);
      // Opcional: Podrías redirigir automáticamente al login si el token no está presente
      // navigate('/'); 
      return; 
    }

    const fetchProfileData = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        const response = await fetch(`${API_URL}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}` // <--- ¡Envía el token JWT en la cabecera!
          },
          // Ya no necesitamos 'credentials: 'include''
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Si el backend devuelve 401 (No Autorizado) o 422 (Token JWT inválido/expirado)
          if (response.status === 401 || response.status === 422) {
            setError(`Autenticación fallida. Por favor, inicia sesión de nuevo. (${errorData.message || response.statusText})`);
            localStorage.removeItem('jwt_token'); // Limpia el token inválido
            navigate('/'); // Redirige al login
          } else {
            setError(`Error al cargar los datos del perfil: ${response.statusText || 'Error desconocido'}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("No se pudo conectar con el servidor o cargar el perfil.");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]); // Dependencia en navigate

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div>
        Error: {error}
        <button onClick={() => navigate('/')}>Ir a Iniciar Sesión</button>
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
      {/* El botón de logout lo moveremos al NavBar o a un componente de Dashboard */}
      {/* Por ahora, lo mantenemos aquí para que funcione */}
      <button onClick={() => {
        localStorage.removeItem('jwt_token'); // Elimina el token del almacenamiento local
        navigate('/'); // Redirige a la página de inicio de sesión
      }}>Cerrar Sesión</button>
    </div>
  );
};

export default Profile;