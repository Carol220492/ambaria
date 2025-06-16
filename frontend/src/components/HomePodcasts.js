// frontend/src/components/HomePodcasts.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import audioPlayerStore from '../store/useAudioPlayerStore';
// --- IMPORTAR ESTILOS COMUNES ---
import { pageContainerStyle, contentBoxStyle, primaryButtonStyle } from '../styles/commonStyles';

const HomePodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentPlayingPodcast = audioPlayerStore.getState().currentPodcast;
  const isPlaying = audioPlayerStore.getState().isPlaying; // Obtener el estado de reproducción
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPodcasts = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('No autenticado. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      console.log(`DEBUG HOME: Obteniendo podcasts de: ${API_URL}/podcasts`);
      try {
        const response = await axios.get(`${API_URL}/podcasts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPodcasts(response.data.podcasts);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener podcasts:', err);
        setError('Error al cargar podcasts.');
        setLoading(false);
        if (err.response && (err.response.status === 401 || err.response.status === 422)) {
            localStorage.removeItem('jwt_token');
            navigate('/', { replace: true });
        }
      }
    };

    fetchPodcasts();
  }, [navigate, API_URL]);

  if (loading) {
    return (
      // Aplicar estilo de contenedor de página común
      <div style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start' }}>
        <NavBar />
        <p>Cargando podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      // Aplicar estilo de contenedor de página común
      <div style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start', color: 'red' }}>
        <NavBar />
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={primaryButtonStyle}>Volver a Iniciar Sesión</button>
      </div>
    );
  }

  return (
    // Aplicar estilo de contenedor de página común
    <div style={pageContainerStyle}>
      <NavBar />
      {/* Aplicar estilo de caja de contenido común */}
      <div style={{ ...contentBoxStyle, maxWidth: '1200px' }}> {/* Sobreescribe maxWidth si es necesario */}
        <h1 style={{ color: '#00FFFF', marginBottom: '20px', textAlign: 'center' }}>Explorar Podcasts</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {podcasts.map((podcast) => (
            <div
              key={podcast.id}
              style={{
                backgroundColor: '#3a3a5a', // Estilo específico de la tarjeta
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {podcast.cover_image_url && (
                <img
                  src={podcast.cover_image_url}
                  alt={podcast.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                  }}
                />
              )}
              <h3 style={{ color: '#00FFFF', fontSize: '1.4em', margin: '10px 0' }}>{podcast.title}</h3>
              <p style={{ color: '#ccc', fontSize: '1em', margin: '0 0 10px 0' }}>Artista: {podcast.artist}</p>
              <p style={{ color: '#aaa', fontSize: '0.9em', margin: '0 0 15px 0', maxHeight: '80px', overflow: 'hidden' }}>{podcast.description}</p>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', width: '100%', justifyContent: 'center' }}>
                <button
                  onClick={() => audioPlayerStore.getState().playPodcast(podcast)}
                  style={{
                    ...primaryButtonStyle, // Aplicar estilo de botón primario
                    backgroundColor: (currentPlayingPodcast && currentPlayingPodcast.id === podcast.id && isPlaying) ? '#4CAF50' : '#cc00cc',
                    flex: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = (currentPlayingPodcast && currentPlayingPodcast.id === podcast.id && isPlaying) ? '#45a049' : '#e600e6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = (currentPlayingPodcast && currentPlayingPodcast.id === podcast.id && isPlaying) ? '#4CAF50' : '#cc00cc'}
                >
                  {(currentPlayingPodcast && currentPlayingPodcast.id === podcast.id && isPlaying) ? 'Reproduciendo...' : 'Reproducir'}
                </button>
                <Link
                  to={`/podcast/${podcast.id}`}
                  style={{
                    ...primaryButtonStyle, // Aplicar estilo de botón primario
                    backgroundColor: '#007bff',
                    textDecoration: 'none',
                    textAlign: 'center',
                    flex: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePodcasts;