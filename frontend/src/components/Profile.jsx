// frontend/src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { pageContainerStyle, contentBoxStyle, primaryButtonStyle, secondaryButtonStyle, dangerButtonStyle } from '../styles/commonStyles.jsx';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [userPodcasts, setUserPodcasts] = useState([]);
  const [podcastLoading, setPodcastLoading] = useState(true);
  const [podcastError, setPodcastError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  const handleEditPodcast = (podcastId) => {
    navigate(`/edit-podcast/${podcastId}`);
  };


  if (loading) {
    return <div className="main-content-wrapper" style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start' }}>Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div className="main-content-wrapper" style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start', color: 'red' }}>
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={primaryButtonStyle}>
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  if (!userData) {
      return <div className="main-content-wrapper" style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start' }}>No se encontraron datos de usuario.</div>;
  }

  return (
    <div className="main-content-wrapper" style={pageContainerStyle}>
      <div style={{ ...contentBoxStyle, maxWidth: '100%', margin: '0 auto' }}>
        <h1 style={{ color: '#00FFFF', marginBottom: '20px' }}>Mi Perfil</h1>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
            <button
                onClick={() => navigate(-1)}
                style={secondaryButtonStyle}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#777'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
            >
                &larr; Atrás
            </button>
            <Link
                to="/home-podcasts"
                style={{
                    ...primaryButtonStyle,
                    textDecoration: 'none',
                    textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
                🏠 Home
            </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #444', paddingBottom: '20px' }}>
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
          /* CORRECCIÓN: Aquí faltaba una llave de cierre '}' */
          <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', /* Ajuste para móvil */
              gap: '20px', /* Espacio entre tarjetas */
              justifyContent: 'center', /* Centrar la cuadrícula si hay pocas columnas */
              alignItems: 'stretch' /* Asegura que las tarjetas tengan la misma altura */
          }}>
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
                      height: 'auto',
                      maxHeight: '150px', /* Limita la altura para móvil */
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}
                  />
                )}
                <h3 style={{ color: '#00FFFF', fontSize: '1.2em', margin: '10px 0' }}>{podcast.title}</h3>
                <p style={{ color: '#ccc', fontSize: '0.9em', margin: '0 0 10px 0' }}>Artista: {podcast.artist}</p>
                <p style={{ color: '#aaa', fontSize: '0.8em', margin: '0 0 15px 0', maxHeight: '60px', overflow: 'hidden' }}>{podcast.description}</p>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
                    <button
                        onClick={() => handleEditPodcast(podcast.id)}
                        style={primaryButtonStyle}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDeletePodcast(podcast.id)}
                        style={dangerButtonStyle}
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