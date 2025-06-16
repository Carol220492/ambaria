// frontend/src/components/HomePodcasts.js
import React, { useEffect, useState } from 'react'; // Eliminado useContext si no se usa
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import audioPlayerStore from '../store/useAudioPlayerStore';
import { pageContainerStyle, contentBoxStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles/commonStyles'; // Importa secondaryButtonStyle

const HomePodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentPlayingPodcast = audioPlayerStore.getState().currentPodcast;
  const isPlaying = audioPlayerStore.getState().isPlaying;
  const navigate = useNavigate();

  // --- NUEVOS ESTADOS PARA CATEGORÍAS Y FILTRO ---
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All' para mostrar todas las categorías inicialmente

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Efecto para obtener PODCASTS (ahora con filtro de categoría)
  useEffect(() => {
    const fetchPodcasts = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('No autenticado. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      setLoading(true); // Siempre que se inicie la carga, mostrar loader
      setError(null); // Limpiar errores previos

      let url = `${API_URL}/podcasts`;
      // Si hay una categoría seleccionada (y no es 'All'), añadirla como parámetro de consulta
      if (selectedCategory && selectedCategory !== 'All') {
        url = `${API_URL}/podcasts?category=${encodeURIComponent(selectedCategory)}`;
      }
      
      console.log(`DEBUG HOME: Obteniendo podcasts de: ${url}`);
      try {
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPodcasts(response.data.podcasts);
      } catch (err) {
        console.error('Error al obtener podcasts:', err);
        setError('Error al cargar podcasts.');
        if (err.response && (err.response.status === 401 || err.response.status === 422)) {
            localStorage.removeItem('jwt_token');
            navigate('/', { replace: true });
        }
      } finally {
          setLoading(false); // Asegurarse de ocultar el loader al finalizar
      }
    };

    fetchPodcasts();
  }, [navigate, API_URL, selectedCategory]); // Dependencia clave: selectedCategory

  // --- NUEVO EFECTO PARA OBTENER CATEGORÍAS ---
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return; // No intentar obtener categorías si no está autenticado
      }
      try {
        const response = await axios.get(`${API_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Añadir 'All' al principio de la lista de categorías
        setCategories(['All', ...response.data.categories]);
      } catch (err) {
        console.error('Error al obtener categorías:', err);
      }
    };
    fetchCategories();
  }, [API_URL]);


  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  if (loading && podcasts.length === 0) { // Mostrar cargando solo si no hay podcasts ya cargados
    return (
      <div style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start' }}>
        <NavBar />
        <p>Cargando podcasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start', color: 'red' }}>
        <NavBar />
        <p>{error}</p>
        <button onClick={() => navigate('/')} style={primaryButtonStyle}>Volver a Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={pageContainerStyle}>
      <NavBar />
      <div style={{ ...contentBoxStyle, maxWidth: '1200px' }}>
        <h1 style={{ color: '#00FFFF', marginBottom: '20px', textAlign: 'center' }}>Explorar Podcasts</h1>

        {/* --- CARRUSEL DE CATEGORÍAS --- */}
        <div style={{
          overflowX: 'auto', // Permite el desplazamiento horizontal
          whiteSpace: 'nowrap', // Evita que los elementos se envuelvan a la siguiente línea
          paddingBottom: '10px', // Espacio para la barra de desplazamiento
          marginBottom: '30px',
          display: 'flex', // Asegura que los elementos estén en una fila
          gap: '10px', // Espacio entre los botones
          justifyContent: 'center', // Centra los elementos horizontalmente
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              style={{
                ...secondaryButtonStyle, // Estilo base para los botones de categoría
                backgroundColor: selectedCategory === category ? '#007bff' : '#555', // Azul si seleccionado, gris si no
                color: 'white',
                padding: '8px 15px',
                borderRadius: '20px', // Botones más redondeados
                cursor: 'pointer',
                flexShrink: 0, // Evita que los botones se encojan
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = selectedCategory === category ? '#0056b3' : '#777'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedCategory === category ? '#007bff' : '#555'}
            >
              {category === 'All' ? 'Todas las Categorías' : category}
            </button>
          ))}
        </div>
        {/* --- FIN CARRUSEL DE CATEGORÍAS --- */}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {podcasts.length === 0 && !loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ccc' }}>No se encontraron podcasts para esta categoría.</p>
          ) : (
            podcasts.map((podcast) => (
              <div
                key={podcast.id}
                style={{
                  backgroundColor: '#3a3a5a',
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
                      ...primaryButtonStyle,
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
                      ...primaryButtonStyle,
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePodcasts;