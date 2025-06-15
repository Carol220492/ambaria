// frontend/src/components/EditPodcast.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';

const EditPodcast = () => {
    const { id } = useParams(); // Obtiene el ID del podcast de la URL
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(''); // Usa 'category' para coincidir con el backend
    const [audioFile, setAudioFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
                // Obtener los detalles del podcast
                const response = await axios.get(`${API_URL}/podcasts/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const podcast = response.data;
                setTitle(podcast.title);
                setDescription(podcast.description);
                setCategory(podcast.category); // 'category' en el backend
                // No cargamos los archivos de audio/imagen directamente, solo sus URLs para referencia
                // El usuario subirá nuevos si quiere cambiarlos
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
        // Solo añade campos si han sido modificados o si quieres que siempre se envíen
        // Para PUT, es común enviar todos los campos actuales.
        if (title) formData.append('title', title);
        if (description) formData.append('description', description);
        if (category) formData.append('category', category); // Usa 'category'
        if (audioFile) formData.append('audio_file', audioFile);
        if (coverImage) formData.append('cover_image', coverImage);

        try {
            const response = await axios.put(`${API_URL}/podcasts/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' es manejado por axios/fetch
                },
            });

            if (response.status === 200) {
                setMessage('Podcast actualizado con éxito!');
                // Opcional: Redirigir al perfil o a la página de detalles del podcast
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
        return <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>Cargando datos del podcast...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>Error: {error}</div>;
    }

    return (
        <div>
            <NavBar />
            <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)', backgroundColor: '#2a2a4a', color: 'white' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00FFFF' }}>Editar Podcast</h2>
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="4"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
                        />
                        {audioFile && <p style={{ fontSize: '0.9em', color: '#ccc' }}>Seleccionado: {audioFile.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="cover_image" style={{ display: 'block', marginBottom: '5px' }}>Cambiar Imagen de Portada (Opcional):</label>
                        <input
                            type="file"
                            id="cover_image"
                            name="cover_image"
                            accept=".png,.jpg,.jpeg,.gif"
                            onChange={handleFileChange}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
                        />
                        {coverImage && <p style={{ fontSize: '0.9em', color: '#ccc' }}>Seleccionado: {coverImage.name}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {submitting ? 'Actualizando...' : 'Actualizar Podcast'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditPodcast;