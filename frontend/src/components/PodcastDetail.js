import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Importa Link
import axios from 'axios';
import NavBar from './NavBar';
import audioPlayerStore from '../store/useAudioPlayerStore'; // Importa la instancia del store
import { AuthContext } from '../context/AuthContext';

const PodcastDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // No necesitas destructuring aquí, accedes directamente a audioPlayerStore.getState().action()
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPodcastDetails = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('No autenticado. Por favor, inicia sesión.');
        setLoading(false);
        navigate('/');
        return;
      }

      console.log(`DEBUG PODCAST DETAIL: Obteniendo detalles del podcast ${id} de: ${API_URL}/podcasts/${id}`);
      try {
        const response = await axios.get(`${API_URL}/podcasts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("DEBUG PODCAST DETAIL: Detalles recibidos:", response.data);
        setPodcast(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener detalles del podcast:', err.response?.data || err.message);
        setError('Error al cargar los detalles del podcast.');
        setLoading(false);
      }
    };

    fetchPodcastDetails();
  }, [id, navigate, API_URL]);

  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.log("DEBUG PODCAST DETAIL: No hay token para cargar comentarios.");
        return;
      }

      console.log(`DEBUG PODCAST DETAIL: Obteniendo comentarios para podcast ${id} de: ${API_URL}/api/podcasts/${id}/comments`);
      try {
        const response = await axios.get(`${API_URL}/api/podcasts/${id}/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("DEBUG PODCAST DETAIL: Comentarios recibidos:", response.data.comments);
        setComments(response.data.comments);
      } catch (err) {
        console.error('Error al obtener comentarios:', err.response?.data || err.message);
        if (err.response && err.response.status !== 404) {
          setError('Error al cargar los comentarios.');
        } else if (!err.response) {
          setError('No se pudo conectar para cargar comentarios.');
        }
      }
    };

    if (podcast) {
      fetchComments();
    }
  }, [id, podcast, API_URL]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    setError(null);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Debes iniciar sesión para comentar.');
      setCommentLoading(false);
      return;
    }

    if (!newCommentText.trim()) {
      setError('El comentario no puede estar vacío.');
      setCommentLoading(false);
      return;
    }

    console.log(`DEBUG PODCAST DETAIL: Enviando comentario para podcast ${id} a: ${API_URL}/api/podcasts/${id}/comments`);
    try {
      const response = await axios.post(`${API_URL}/api/podcasts/${id}/comments`, {
        text: newCommentText
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("DEBUG PODCAST DETAIL: Comentario publicado:", response.data.comment);
      setComments([response.data.comment, ...comments]);
      setNewCommentText('');
      setCommentLoading(false);
    } catch (err) {
      console.error('Error al añadir comentario:', err.response?.data || err.message);
      setError(`Error al publicar el comentario: ${err.response?.data?.error || 'Desconocido'}`);
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('No estás autenticado para eliminar comentarios.');
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.')) {
      console.log(`DEBUG PODCAST DETAIL: Eliminando comentario con ID: ${commentId} de: ${API_URL}/api/comments/${commentId}`);
      try {
        await axios.delete(`${API_URL}/api/comments/${commentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("DEBUG PODCAST DETAIL: Comentario eliminado:", commentId);
        setComments(comments.filter(comment => comment.id !== commentId));
        alert('Comentario eliminado con éxito.');
      } catch (err) {
        console.error('Error al eliminar comentario:', err.response?.data || err.message);
        alert(`Error al eliminar comentario: ${err.response?.data?.error || 'Error desconocido'}`);
      }
    }
  };


  if (loading) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
        <NavBar />
        <p>Cargando detalles del podcast...</p>
      </div>
    );
  }

  if (error && !podcast) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>
        <NavBar />
        <p>{error}</p>
        <button onClick={() => navigate('/home-podcasts')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Volver</button>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
        <NavBar />
        <p>No se encontraron detalles para este podcast.</p>
        <button onClick={() => navigate('/home-podcasts')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Volver</button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#282c34', // Fondo específico para esta página
      minHeight: '100vh',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <NavBar />
      <div style={{
        maxWidth: '800px',
        margin: 'auto',
        backgroundColor: '#3a3f47',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        padding: '30px',
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* --- NUEVOS BOTONES DE NAVEGACIÓN --- */}
        <div style={{ alignSelf: 'flex-start', marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    padding: '8px 15px',
                    backgroundColor: '#555',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#777'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
            >
                &larr; Atrás
            </button>
            <Link
                to="/home-podcasts"
                style={{
                    padding: '8px 15px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    textDecoration: 'none',
                    transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
                🏠 Home
            </Link>
        </div>
        {/* --- FIN NUEVOS BOTONES DE NAVEGACIÓN --- */}

        {podcast.cover_image_url && (
          <img
            src={podcast.cover_image_url}
            alt={podcast.title}
            style={{
              width: '100%',
              maxWidth: '300px',
              height: 'auto',
              borderRadius: '8px',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          />
        )}
        <h1 style={{ color: '#8AFFD2', marginBottom: '10px', textAlign: 'center' }}>{podcast.title}</h1>
        {/* Aquí usas podcast.artist, asegúrate que tu backend lo devuelva.
            Si el artista es el nombre del usuario, podrías usar: {podcast.user.name}
            Ajusta según lo que tu backend realmente envíe para 'artist'.
        */}
        {podcast.artist && <p style={{ color: '#bbb', fontSize: '1.1em', marginBottom: '15px' }}>Artista: {podcast.artist}</p>}
        <p style={{ lineHeight: '1.6', textAlign: 'center', marginBottom: '20px' }}>{podcast.description}</p>

        <button
          onClick={() => audioPlayerStore.getState().playPodcast(podcast)} // Llamada directa a la acción del store
          style={{
            padding: '12px 25px',
            backgroundColor: '#cc00cc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1.1em',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
            marginBottom: '30px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e600e6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#cc00cc'}
        >
          Reproducir Podcast
        </button>

        {/* --- SECCIÓN DE COMENTARIOS --- */}
        <div style={{ width: '100%', marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' }}>
          <h2 style={{ color: '#8AFFD2', marginBottom: '20px', textAlign: 'center' }}>Comentarios</h2>

          {/* Formulario para añadir un comentario */}
          {user && ( // Solo mostrar el formulario si hay un usuario autenticado
            <form onSubmit={handleAddComment} style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Escribe tu comentario aquí..."
                rows="4"
                style={{
                  width: '90%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #555',
                  backgroundColor: '#4a4f57',
                  color: 'white',
                  fontSize: '1em',
                  marginBottom: '15px',
                  resize: 'vertical'
                }}
              ></textarea>
              <button
                type="submit"
                disabled={commentLoading || !newCommentText.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: commentLoading || !newCommentText.trim() ? '#666' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: commentLoading || !newCommentText.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1em',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => { if (!commentLoading && newCommentText.trim()) e.currentTarget.style.backgroundColor = '#0056b3'; }}
                onMouseLeave={(e) => { if (!commentLoading && newCommentText.trim()) e.currentTarget.style.backgroundColor = '#007bff'; }}
              >
                {commentLoading ? 'Publicando...' : 'Publicar Comentario'}
              </button>
              {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
          )}
          {!user && (
            <p style={{ textAlign: 'center', color: '#bbb' }}>Inicia sesión para poder comentar.</p>
          )}


          {/* Lista de comentarios */}
          {comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#bbb' }}>Sé el primero en comentar este podcast.</p>
          ) : (
            <div style={{ width: '100%' }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{
                  backgroundColor: '#4a4f57',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  position: 'relative'
                }}>
                  {/* Foto de perfil del comentador */}
                  {comment.profile_picture && (
                    <img
                      src={comment.profile_picture}
                      alt={comment.username}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        marginRight: '15px',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#8AFFD2' }}>
                      {comment.username}
                      <span style={{ fontSize: '0.8em', color: '#bbb', fontWeight: 'normal', marginLeft: '10px' }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </p>
                    <p style={{ margin: 0, lineHeight: '1.4' }}>{comment.text}</p>
                  </div>
                  {/* Botón de eliminar (solo si el usuario actual es el autor del comentario) */}
                  {user && String(user.user_id) === String(comment.user_id) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff6666',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        marginLeft: '10px',
                        alignSelf: 'center',
                        position: 'absolute',
                        top: '15px',
                        right: '15px'
                      }}
                      title="Eliminar comentario"
                    >
                      &#x2715;
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastDetail;