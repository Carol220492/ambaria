// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Importa Axios

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ESTADO para los podcasts del usuario
  const [userPodcasts, setUserPodcasts] = useState([]);
  const [podcastLoading, setPodcastLoading] = useState(true);
  const [podcastError, setPodcastError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // useEffect para obtener los datos del perfil
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      setError("No hay token de autenticación. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error al obtener perfil:", response.status, errorData.message || errorData.error || "Error desconocido");
          setError(errorData.message || errorData.error || "Error al cargar el perfil.");
          setLoading(false);
          if (response.status === 401 || response.status === 422) {
              localStorage.removeItem('jwt_token');
              navigate('/', { replace: true });
          }
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
  }, [navigate, API_URL]);

  // useEffect para obtener los podcasts del usuario
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      setPodcastError("No autenticado. Por favor, inicia sesión para ver tus podcasts.");
      setPodcastLoading(false);
      return;
    }

    const fetchUserPodcasts = async () => {
      try {
        console.log(`DEBUG PROFILE: Obteniendo podcasts del usuario de: ${API_URL}/podcasts/my_podcasts`);
        const response = await axios.get(`${API_URL}/podcasts/my_podcasts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          setUserPodcasts(response.data.podcasts);
        } else {
          setPodcastError(response.data.error || "Error al cargar tus podcasts.");
        }
        setPodcastLoading(false);

      } catch (err) {
        console.error("Error fetching user podcasts:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 422)) {
            setPodcastError("Sesión expirada o no válida. Por favor, inicia sesión de nuevo.");
            localStorage.removeItem('jwt_token');
            navigate('/', { replace: true });
        } else {
            setPodcastError("No se pudo conectar con el servidor o cargar tus podcasts.");
        }
        setPodcastLoading(false);
      }
    };

    if (!loading && !error) {
        fetchUserPodcasts();
    }
  }, [loading, error, navigate, API_URL]);

  // NUEVA FUNCIÓN: Manejar la eliminación de un podcast
  const handleDeletePodcast = async (podcastId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este podcast? Esta acción no se puede deshacer.")) {
      return;
    }

    setPodcastLoading(true);
    const token = localStorage.getItem('jwt_token');

    try {
      console.log(`DEBUG PROFILE: Eliminando podcast con ID: ${podcastId}`);
      const response = await axios.delete(`${API_URL}/podcasts/${podcastId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert(response.data.message);
        setUserPodcasts(userPodcasts.filter(p => p.id !== podcastId));
      } else {
        alert(response.data.error || "Error al eliminar el podcast.");
      }
    } catch (err) {
      console.error("Error deleting podcast:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 422)) {
          alert(err.response.data.error || "No tienes permiso para eliminar este podcast o tu sesión ha expirado.");
          if (err.response.status === 401 || err.response.status === 422) {
              localStorage.removeItem('jwt_token');
              navigate('/', { replace: true });
          }
      } else {
          alert("Error al conectar con el servidor o eliminar el podcast.");
      }
    } finally {
      setPodcastLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Manejar la edición de un podcast
  const handleEditPodcast = (podcastId) => {
    navigate(`/edit-podcast/${podcastId}`);
  };


  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: '#cc00cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  if (!userData) {
      return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>No se encontraron datos de usuario.</div>;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a32', minHeight: '100vh', color: 'white', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#2a2a4a', padding: '30px', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
        <h1 style={{ color: '#00FFFF', marginBottom: '20px' }}>Mi Perfil</h1>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #444', paddingBottom: '20px' }}>
          {userData.profile_picture && (
            <img src={userData.profile_picture} alt="Foto de Perfil" style={{ borderRadius: '50%', width: '120px', height: '120px', objectFit: 'cover', marginRight: '20px', border: '3px solid #cc00cc' }} />
          )}
          <div>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0 0 5px 0' }}>{userData.name || userData.email}</p>
            <p style={{ fontSize: '1em', color: '#ccc', margin: '0' }}>{userData.email}</p>
            <p style={{ fontSize: '0.9em', color: '#999', margin: '5px 0 0 0' }}>ID de Usuario: {userData.user_id}</p>
          </div>
        </div>

        <h2 style={{ color: '#8AFFD2', marginBottom: '20px', marginTop: '30px' }}>Mis Podcasts Subidos</h2>

        {podcastLoading ? (
          <div style={{ textAlign: 'center' }}>Cargando tus podcasts...</div>
        ) : podcastError ? (
          <div style={{ color: 'red', textAlign: 'center' }}>Error al cargar podcasts: {podcastError}</div>
        ) : userPodcasts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#ccc' }}>Aún no has subido ningún podcast.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {userPodcasts.map((podcast) => (
              <div key={podcast.id} style={{
                backgroundColor: '#3a3a5a',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                {podcast.cover_image_url && (
                  <img
                    src={podcast.cover_image_url}
                    alt={podcast.title}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  />
                )}
                <h3 style={{ color: '#00FFFF', fontSize: '1.2em', margin: '10px 0' }}>{podcast.title}</h3>
                <p style={{ color: '#ccc', fontSize: '0.9em', margin: '0 0 10px 0' }}>Artista: {podcast.artist}</p>
                <p style={{ color: '#aaa', fontSize: '0.8em', margin: '0 0 15px 0', maxHeight: '60px', overflow: 'hidden' }}>{podcast.description}</p>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button
                        onClick={() => handleEditPodcast(podcast.id)} // <--- ¡CAMBIO AQUÍ!
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeletePodcast(podcast.id)}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.9em',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                    >
                        Eliminar
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;