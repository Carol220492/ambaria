import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useParams para leer el ID de la URL

const PodcastDetail = () => {
  const { id } = useParams(); // Obtiene el ID del podcast de la URL
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPodcastDetails = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError("No autenticado. Por favor, inicia sesión.");
        setLoading(false);
        navigate('/'); // Redirige al login si no hay token
        return;
      }

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        console.log(`DEBUG PODCAST DETAIL: Obteniendo detalles del podcast ${id} de: ${API_URL}/podcasts/${id}`);
        const response = await fetch(`${API_URL}/podcasts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Podcast no encontrado.");
          } else if (response.status === 401) {
            localStorage.removeItem('jwt_token');
            setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
            navigate('/');
          } else {
            setError(`Error al cargar los detalles del podcast: ${response.statusText}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("DEBUG PODCAST DETAIL: Detalles recibidos:", data);
        setPodcast(data);
        setLoading(false);

      } catch (err) {
        console.error("Error al obtener detalles del podcast:", err);
        setError("No se pudo conectar con el servidor o cargar los detalles del podcast.");
        setLoading(false);
      }
    };

    fetchPodcastDetails();
  }, [id, navigate]); // Dependencias: se ejecuta cuando cambia el ID o navigate

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
        <p>Cargando detalles del podcast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/home-podcasts')} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Volver a la lista de podcasts
        </button>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>
        <p>No se encontraron datos para este podcast.</p>
        <button onClick={() => navigate('/home-podcasts')} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Volver a la lista de podcasts
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', background: 'rgba(26, 26, 64, 0.9)', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
      <button onClick={() => navigate('/home-podcasts')} style={{ float: 'right', padding: '8px 15px', backgroundColor: '#cc00cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Volver
      </button>
      <h1 style={{ color: '#00FFFF', textAlign: 'left', marginBottom: '20px' }}>{podcast.title}</h1>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        {podcast.cover_image_url && (
            <img
                src={podcast.cover_image_url}
                alt={`Portada de ${podcast.title}`}
                style={{ width: '250px', height: '250px', borderRadius: '10px', marginRight: '25px', objectFit: 'cover', boxShadow: '0 0 10px rgba(0, 255, 255, 0.7)' }}
            />
        )}
        <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '1.2em', color: '#E6B3FF', margin: '5px 0' }}>**Artista:** {podcast.artist}</p>
            <p style={{ fontSize: '1.1em', color: '#8AFFD2', margin: '5px 0' }}>**Género:** {podcast.genre}</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '15px 0' }}>{podcast.description}</p>
            <p style={{ fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.6)' }}>Subido el: {new Date(podcast.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      
      {podcast.audio_url && (
          <audio controls style={{ width: '100%', marginTop: '20px' }}>
              <source src={podcast.audio_url} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
          </audio>
      )}
    </div>
  );
};

export default PodcastDetail;