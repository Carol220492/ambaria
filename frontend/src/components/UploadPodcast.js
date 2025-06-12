// frontend/src/components/UploadPodcast.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar'; // Necesitarás el NavBar aquí también

const UploadPodcast = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
            navigate('/'); // Redirigir al login si no hay token
            return;
        }

        if (!audioFile) {
            setError('Por favor, selecciona un archivo de audio.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('genre', genre);
        formData.append('description', description);
        formData.append('audio_file', audioFile);
        if (coverImage) {
            formData.append('cover_image', coverImage);
        }

        try {
            const response = await fetch(`${API_URL}/podcasts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' // ¡IMPORTANTE! No establecer Content-Type para FormData, el navegador lo hace automáticamente y lo hace mal si lo pones tú.
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al subir el podcast.');
            }

            const data = await response.json();
            setMessage(data.message || 'Podcast subido con éxito.');
            // Limpiar el formulario
            setTitle('');
            setArtist('');
            setGenre('');
            setDescription('');
            setAudioFile(null);
            setCoverImage(null);
            // Si quieres redirigir a HomePodcasts después de subir
            // navigate('/home-podcasts'); 

        } catch (err) {
            console.error('Error uploading podcast:', err);
            setError(err.message || 'Error desconocido al subir el podcast.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavBar />
            <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h1>Subir Nuevo Podcast</h1>
                {message && <p style={{ color: 'green' }}>{message}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="artist" style={{ display: 'block', marginBottom: '5px' }}>Artista:</label>
                        <input
                            type="text"
                            id="artist"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="genre" style={{ display: 'block', marginBottom: '5px' }}>Género:</label>
                        <input
                            type="text"
                            id="genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descripción (Opcional):</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="audio_file" style={{ display: 'block', marginBottom: '5px' }}>Archivo de Audio:</label>
                        <input
                            type="file"
                            id="audio_file"
                            name="audio_file"
                            accept=".mp3,.wav,.ogg,.aac,.flac"
                            onChange={handleFileChange}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        {audioFile && <p style={{ fontSize: '0.9em', color: '#555' }}>Seleccionado: {audioFile.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="cover_image" style={{ display: 'block', marginBottom: '5px' }}>Imagen de Portada (Opcional):</label>
                        <input
                            type="file"
                            id="cover_image"
                            name="cover_image"
                            accept=".png,.jpg,.jpeg,.gif"
                            onChange={handleFileChange}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        {coverImage && <p style={{ fontSize: '0.9em', color: '#555' }}>Seleccionado: {coverImage.name}</p>}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            padding: '10px 15px', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Subiendo...' : 'Subir Podcast'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPodcast;