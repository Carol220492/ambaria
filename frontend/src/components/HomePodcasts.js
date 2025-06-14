import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAudioPlayerStore from '../store/useAudioPlayerStore'; // ¡NUEVA IMPORTACIÓN DEL STORE!

const HomePodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Acceder a la función playPodcast del store de Zustand
  const playPodcast = useAudioPlayerStore((state) => state.playPodcast);
  const currentPodcast = useAudioPlayerStore((state) => state.currentPodcast); // Para resaltar el que se está reproduciendo

  useEffect(() => {
    const fetchPodcasts = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError("No autenticado. Por favor, inicia sesión.");
        setLoading(false);
        navigate('/');
        return;
      }

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        console.log(`DEBUG HOME: Obteniendo podcasts de: ${API_URL}/podcasts`);
        const response = await axios.get(`${API_URL}/podcasts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Tu API devuelve un objeto con la clave 'podcasts'
        setPodcasts(response.data.podcasts); 
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener podcasts:", err);
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            localStorage.removeItem('jwt_token');
            setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            navigate('/');
          } else {
            setError(`Error al cargar los podcasts: ${err.response.statusText || err.message}`);
          }
        } else {
          setError("No se pudo conectar con el servidor o cargar los podcasts.");
        }
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
        <p>Cargando podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Volver al Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', paddingTop: '80px', background: 'radial-gradient(circle, #0a0a2a, #000000)', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ color: '#00FFFF', textAlign: 'center', marginBottom: '30px' }}>Todos los Podcasts</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: '80px' // Espacio para el reproductor global
      }}>
        {podcasts.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>No hay podcasts disponibles. ¡Sé el primero en subir uno!</p>
        ) : (
          podcasts.map(podcast => (
            <div
              key={podcast.id}
              style={{
                background: 'rgba(26, 26, 64, 0.8)',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: `0 0 15px ${currentPodcast && currentPodcast.id === podcast.id ? 'rgba(0, 255, 255, 1)' : 'rgba(0, 255, 255, 0.5)'}`, // Resaltar si está reproduciendo
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%' // Asegura que las tarjetas tengan la misma altura si el contenido es variable
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {podcast.cover_image_url && (
                <img
                  src={podcast.cover_image_url}
                  alt={podcast.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
                />
              )}
              <h3 style={{ color: '#00FFFF', marginBottom: '10px', fontSize: '1.4em' }}>{podcast.title}</h3>
              <p style={{ color: '#E6B3FF', fontSize: '1em', marginBottom: '5px' }}>**Artista:** {podcast.artist}</p>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9em', flexGrow: 1 }}>
                {podcast.description.substring(0, 100)}{podcast.description.length > 100 ? '...' : ''}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '10px' }}>
                <button
                  onClick={() => playPodcast(podcast)} // ¡AHORA HACE PLAY EN EL REPRODUCTOR GLOBAL!
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    backgroundColor: '#cc00cc', // Botón de reproducir
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e600e6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#cc00cc'}
                >
                  Reproducir
                </button>
                <button
                  onClick={() => navigate(`/podcast/${podcast.id}`)} // Mantiene la navegación a detalles
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    backgroundColor: '#007bff', // Botón de ver detalles
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePodcasts;