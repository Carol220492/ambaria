// frontend/src/components/ContactForm.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link
import NavBar from './NavBar'; // Importa el NavBar

const ContactForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(''); // Para mensajes de éxito/error
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitMessage(''); // Limpia mensajes anteriores

        try {
            // Aquí simularías una llamada a tu API de backend si tuvieras una para contacto
            // Por ahora, solo simularé una respuesta exitosa
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simula una petición de red

            setSubmitMessage('¡Tu mensaje ha sido enviado con éxito! Nos pondremos en contacto contigo pronto.');
            setName('');
            setEmail('');
            setMessage('');
            navigate('/contact-success'); // Redirigir a la página de éxito
        } catch (error) {
            console.error('Error al enviar el mensaje de contacto:', error);
            setSubmitMessage('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#1a1a32', minHeight: '100vh', color: 'white', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <NavBar /> {/* <--- ¡AÑADIDO NAVBAR! */}
            <div style={{ maxWidth: '600px', margin: '20px auto', padding: '30px', backgroundColor: '#2a2a4a', borderRadius: '10px', boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00FFFF' }}>Contáctanos</h2>

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

                {submitMessage && (
                    <p style={{ textAlign: 'center', color: submitMessage.includes('éxito') ? 'lightgreen' : 'red', marginBottom: '15px' }}>
                        {submitMessage}
                    </p>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="message" style={{ display: 'block', marginBottom: '5px' }}>Mensaje:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="5"
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#3a3a5a', color: 'white' }}
                        ></textarea>
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
                        {loading ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactForm;