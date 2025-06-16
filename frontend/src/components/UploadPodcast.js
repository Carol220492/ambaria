// frontend/src/components/UploadPodcast.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link
import NavBar from './NavBar';

const UploadPodcast = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState(''); // Si usas user.name como artista, este podría ser redundante
    const [genre, setGenre] = useState(''); // Si usas 'category' en el backend, renómbralo o mapea.
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

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', genre); // Asegúrate de que 'genre' mapee a 'category' en el backend
        // Solo adjunta archivos si existen
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
                    // 'Content-Type': 'multipart/form-data' no es necesario con FormData, el navegador lo establece.
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setTitle('');
                setArtist('');
                setGenre('');
                setDescription('');
                setAudioFile(null);
                setCoverImage(null);
                // Opcional: Redirigir después de una subida exitosa
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
        <div style={{ backgroundColor: '#1a1a32', minHeight: '100vh', color: 'white', fontFamily: 'Arial, sans-serif' }}>
            <NavBar />
            <div style={{ maxWidth: '600px', margin: '20px auto', padding: '30px', backgroundColor: '#2a2a4a', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00FFFF' }}>Subir Nuevo Podcast</h2>

                {/* --- NUEVOS BOTONES DE NAVEGACIÓN --- */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
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