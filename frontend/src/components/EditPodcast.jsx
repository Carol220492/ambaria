// frontend/src/components/EditPodcast.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { pageContainerStyle, contentBoxStyle, formInputStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles/commonStyles.jsx';

const EditPodcast = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchPodcastData = async () => {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                setError('No hay token de autenticación. Por favor, inicia sesión.');
                setLoading(false);
                navigate('/');
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/podcasts/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const podcast = response.data;
                setTitle(podcast.title);
                setDescription(podcast.description);
                setCategory(podcast.category);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching podcast for edit:', err);
                setError('No se pudo cargar los detalles del podcast para editar.');
                setLoading(false);
            }
        };

        fetchPodcastData();
    }, [id, navigate, API_URL]);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'audio_file') {
            setAudioFile(files[0]);
        } else if (name === 'cover_image') {
            setCoverImage(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');
        setError('');

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            setError('No hay token de autenticación.');
            setSubmitting(false);
            navigate('/');
            return;
        }

        const formData = new FormData();
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);
        if (category) formData.append('category', category);
        if (audioFile) formData.append('audio_file', audioFile);
        if (coverImage) formData.append('cover_image', coverImage);

        try {
            const response = await axios.put(`${API_URL}/podcasts/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setMessage('Podcast actualizado con éxito!');
                navigate('/profile');
            } else {
                setError(response.data.error || 'Error al actualizar el podcast.');
            }
        } catch (err) {
            console.error('Error updating podcast:', err);
            setError(err.response?.data?.error || 'Error al conectar con el servidor para actualizar.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        // AÑADIDO: className="main-content-wrapper" para centrado responsivo
        return <div className="main-content-wrapper" style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start' }}>Cargando datos del podcast...</div>;
    }

    if (error) {
        // AÑADIDO: className="main-content-wrapper" para centrado responsivo
        return <div className="main-content-wrapper" style={{ ...pageContainerStyle, textAlign: 'center', justifyContent: 'flex-start', color: 'red' }}>Error: {error}</div>;
    }

    return (
        // AÑADIDO: className="main-content-wrapper" al div principal
        <div className="main-content-wrapper" style={pageContainerStyle}>
            <div style={{ ...contentBoxStyle, maxWidth: '100%', margin: '0 auto' }}> {/* Ajustado maxWidth y margin */}
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00FFFF' }}>Editar Podcast</h2>

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

                {message && <p style={{ color: 'lightgreen', textAlign: 'center' }}>{message}</p>}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={formInputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="category" style={{ display: 'block', marginBottom: '5px' }}>Categoría:</label>
                        <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            style={formInputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            style={formInputStyle}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="audio_file" style={{ display: 'block', marginBottom: '5px' }}>Cambiar Archivo de Audio (Opcional):</label>
                        <input
                            type="file"
                            id="audio_file"
                            name="audio_file"
                            accept=".mp3,.wav,.ogg,.aac,.flac"
                            onChange={handleFileChange}
                            style={formInputStyle}
                        />
                        {audioFile && <p style={{ fontSize: '0.9em', color: '#ccc' }}>Seleccionado: {audioFile.name}</p>}\
                    </div>
                    <div>
                        <label htmlFor="cover_image" style={{ display: 'block', marginBottom: '5px' }}>Cambiar Imagen de Portada (Opcional):</label>
                        <input
                            type="file"
                            id="cover_image"
                            name="cover_image"
                            accept=".png,.jpg,.jpeg,.gif"
                            onChange={handleFileChange}
                            style={formInputStyle}
                        />
                        {coverImage && <p style={{ fontSize: '0.9em', color: '#ccc' }}>Seleccionado: {coverImage.name}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={primaryButtonStyle}
                    >
                        {submitting ? 'Actualizando...' : 'Actualizar Podcast'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditPodcast;
