// frontend/src/components/UploadPodcast.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pageContainerStyle, contentBoxStyle, formInputStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles/commonStyles.jsx';

const UploadPodcast = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        setLoading(true);
        setMessage('');
        setError('');

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            setError('No hay token de autenticación. Por favor, inicia sesión.');
            setLoading(false);
            navigate('/');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', genre);
        
        if (audioFile) {
            formData.append('audio_file', audioFile);
        } else {
            setError('Se requiere un archivo de audio.');
            setLoading(false);
            return;
        }
        if (coverImage) {
            formData.append('cover_image', coverImage);
        }

        try {
            const response = await fetch(`${API_URL}/podcasts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setTitle('');
                setGenre('');
                setDescription('');
                setAudioFile(null);
                setCoverImage(null);
                navigate('/home-podcasts');
            } else {
                setError(data.error || 'Error al subir el podcast.');
            }
        } catch (err) {
            console.error('Error al subir el podcast:', err);
            setError('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // AÑADIDO: className="main-content-wrapper" al div principal
        <div className="main-content-wrapper" style={pageContainerStyle}>
            <div style={{ ...contentBoxStyle, maxWidth: '100%', margin: '0 auto' }}> {/* Ajustado maxWidth y margin */}
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00FFFF' }}>Subir Nuevo Podcast</h2>

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
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={formInputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="genre" style={{ display: 'block', marginBottom: '5px' }}>Género/Categoría:</label>
                        <input
                            type="text"
                            id="genre"
                            name="genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            required
                            style={formInputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            style={formInputStyle}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="audio_file" style={{ display: 'block', marginBottom: '5px' }}>Archivo de Audio (Requerido):</label>
                        <input
                            type="file"
                            id="audio_file"
                            name="audio_file"
                            accept=".mp3,.wav,.ogg,.aac,.flac"
                            onChange={handleFileChange}
                            required
                            style={formInputStyle}
                        />
                        {audioFile && <p style={{ fontSize: '0.9em', color: '#ccc' }}>Seleccionado: {audioFile.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="cover_image" style={{ display: 'block', marginBottom: '5px' }}>Imagen de Portada (Opcional):</label>
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
                        disabled={loading}
                        style={primaryButtonStyle}
                    >
                        {loading ? 'Subiendo...' : 'Subir Podcast'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPodcast;
