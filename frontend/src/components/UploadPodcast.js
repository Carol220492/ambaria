// frontend/src/components/UploadPodcast.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar'; // Asegúrate de que NavBar esté importado si lo usas

const UploadPodcast = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState(''); // Mantener este estado por ahora
    const [genre, setGenre] = useState('');   // Este se mapea a 'category' en el backend
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
            navigate('/');
            return;
        }

        // --- AÑADE ESTOS CONSOLE.LOGS PARA DEBUGGING ---
        console.log("DEBUG FRONTEND: Valores de estado antes de FormData:");
        console.log("Título (state):", title);
        console.log("Descripción (state):", description);
        console.log("Categoría (state 'genre'):", genre);
        console.log("Archivo de Audio (state):", audioFile ? audioFile.name : "Ninguno");
        console.log("Imagen de Portada (state):", coverImage ? coverImage.name : "Ninguna");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        // formData.append('artist', artist); // Esta línea se eliminará cuando el campo artista se retire del formulario
        formData.append('category', genre); // 'genre' se mapea a 'category' en el backend
        if (audioFile) {
            formData.append('audio_file', audioFile);
        }
        if (coverImage) {
            formData.append('cover_image', coverImage);
        }

        // --- AÑADE ESTE CONSOLE.LOG PARA VER CONTENIDO REAL DE FormData ---
        console.log("DEBUG FRONTEND: Contenido de FormData que se va a enviar:");
        for (let pair of formData.entries()) {
            console.log(pair[0]+ ': ' + pair[1]);
        }

        // Basic client-side validation (optional, but good practice)
        if (!title || !description || !genre || !audioFile) {
            setError('Por favor, rellena todos los campos obligatorios (título, descripción, categoría, archivo de audio).');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/podcasts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' no se establece aquí, fetch lo hace automáticamente
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al subir el podcast.');
            }

            setMessage('Podcast subido con éxito!');
            // Limpiar los campos después de una subida exitosa
            setTitle('');
            setArtist('');
            setGenre('');
            setDescription('');
            setAudioFile(null);
            setCoverImage(null);
            // Opcional: navegar a la página de podcasts o a una confirmación
            // navigate('/home-podcasts');
        } catch (err) {
            console.error('Error uploading podcast:', err);
            setError(`Error uploading podcast: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavBar />
            <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Subir Nuevo Podcast</h2>
                {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
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
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    {/* Mantener el campo artista por ahora para no romper el frontend, aunque no se envíe al backend */}
                    <div>
                        <label htmlFor="artist" style={{ display: 'block', marginBottom: '5px' }}>Artista (Ignorar por ahora):</label>
                        <input
                            type="text"
                            id="artist"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="genre" style={{ display: 'block', marginBottom: '5px' }}>Categoría:</label>
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
                        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
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