import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- ¡IMPORTA Link y useNavigate!

const HomePodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Importa useNavigate para posibles redirecciones

  useEffect(() => {
    const fetchPodcasts = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError("No autenticado. Por favor, inicia sesión.");
        setLoading(false);
        navigate('/'); // Redirige al login si no hay token
        return;
      }

      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        console.log("DEBUG HOME: Intentando obtener podcasts de:", `${API_URL}/podcasts`);
        const response = await fetch(`${API_URL}/podcasts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
              localStorage.removeItem('jwt_token');
              setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
              navigate('/'); // Redirige al login si el token expiró
          } else {
              setError(`Error al cargar podcasts: ${response.statusText}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("DEBUG HOME: Podcasts recibidos:", data.podcasts);
        setPodcasts(data.podcasts);
        setLoading(false);

      } catch (err) {
        console.error("Error al obtener podcasts:", err);
        setError("No se pudo conectar con el servidor o cargar los podcasts.");
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, [navigate]); // Añade navigate a las dependencias

  if (loading) return <div>Cargando podcasts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div style={{ padding: '20px' }}>
        <h1 style={{ color: '#00FFFF', marginBottom: '30px' }}>Explora Podcasts</h1> {/* Estilo para el título */}
        {podcasts.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No hay podcasts disponibles aún. ¡Sube uno desde la sección de subida!</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {podcasts.map(podcast => (
              // ¡ENVUELVE EL CONTENIDO DEL PODCAST EN UN LINK!
              <Link to={`/podcast/${podcast.id}`} key={podcast.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <li style={{
                    marginBottom: '20px',
                    border: '1px solid #00FFFF', // Borde con color de acento
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(26, 26, 64, 0.7)', // Fondo semi-transparente
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)', // Sombra con brillo neón
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Transición para hover
                    cursor: 'pointer' // Indica que es clicable
                }}
                // Efecto hover (añadir al estilo directamente para simplicidad o en CSS si es complejo)
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)'; }}
                >
                  {podcast.cover_image_url && (
                      <img
                          src={podcast.cover_image_url}
                          alt={`Portada de ${podcast.title}`}
                          style={{ width: '100px', height: '100px', borderRadius: '5px', marginRight: '15px', objectFit: 'cover' }}
                      />
                  )}
                  <div style={{ flexGrow: 1, textAlign: 'left' }}> {/* Alinear texto a la izquierda */}
                      <h3 style={{ color: '#E6B3FF', margin: '0 0 5px 0' }}>{podcast.title}</h3> {/* Título con color de acento */}
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 2px 0' }}>Artista: {podcast.artist}</p>
                      <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9em', margin: '0' }}>Género: {podcast.genre}</p>
                      {/* El reproductor de audio no debe ir aquí si queremos una página de detalles.
                          Solo lo ponemos en la página de detalles ahora.
                      */}
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomePodcasts;