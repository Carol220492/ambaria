// frontend/src/components/ContactForm.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pageContainerStyle, contentBoxStyle, formInputStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles/commonStyles.jsx';

const ContactForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitMessage('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSubmitMessage('¡Tu mensaje ha sido enviado con éxito! Nos pondremos en contacto contigo pronto.');
            setName('');
            setEmail('');
            setMessage('');
            navigate('/contact-success');
        } catch (error) {
            console.error('Error al enviar el mensaje de contacto:', error);
            setSubmitMessage('Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // AÑADIDO: className="main-content-wrapper" al div principal
        <div className="main-content-wrapper" style={pageContainerStyle}>
            <div style={{ ...contentBoxStyle, maxWidth: '100%', margin: '0 auto' }}> {/* Ajustado maxWidth y margin */}
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#00FFFF' }}>Contáctanos</h2>

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
                            style={formInputStyle}
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
                            style={formInputStyle}
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
                            style={formInputStyle}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={primaryButtonStyle}
                    >
                        {loading ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactForm;
