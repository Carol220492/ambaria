// Ejemplo dentro de HomePodcasts.js o un nuevo componente de lista de podcasts
import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';

const HomePodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError("No autenticado. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/podcasts`, { // Ajusta esta URL a tu ruta real
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Manejo de errores, por ejemplo, si el token expiró (401)
          if (response.status === 401) {
              localStorage.removeItem('jwt_token'); // Limpiar token inválido
              // Podrías redirigir al usuario al login: navigate('/');
              setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          } else {
              setError(`Error al cargar podcasts: ${response.statusText}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPodcasts(data.podcasts); // Asumiendo que tu API devuelve un objeto { podcasts: [...] }
        setLoading(false);

      } catch (err) {
        console.error("Error fetching podcasts:", err);
        setError("No se pudo conectar con el servidor o cargar los podcasts.");
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []); // Se ejecuta una vez al montar

  if (loading) return <div>Cargando podcasts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <NavBar />
      <div style={{ padding: '20px' }}>
        <h1>Explora Podcasts</h1>
        {podcasts.length === 0 ? (
          <p>No hay podcasts disponibles aún.</p>
        ) : (
          <ul>
            {podcasts.map(podcast => (
              <li key={podcast.id}>
                <h3>{podcast.title}</h3>
                <p>Artista: {podcast.artist}</p>
                <p>Género: {podcast.genre}</p>
                {/* Aquí puedes añadir un reproductor de audio, imagen, etc. */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomePodcasts;