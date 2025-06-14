import React, { useState } from 'react';

const ContactForm = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending'); // Establecer estado de envío

    const form = event.target;
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json' // Importante para recibir una respuesta JSON de formsubmit
        }
      });

      if (response.ok) {
        setStatus('success');
        form.reset(); // Limpia el formulario
      } else {
        setStatus('error');
        const errorData = await response.json(); // Intentar leer el error
        console.error('Error de FormSubmit:', errorData);
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setStatus('error');
    }
  };

  return (
    <div style={{
        padding: '20px',
        maxWidth: '500px',
        margin: '50px auto',
        background: 'rgba(26, 26, 64, 0.9)',
        borderRadius: '10px',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
        color: 'white',
        textAlign: 'center'
    }}>
      <h2 style={{ color: '#00FFFF', marginBottom: '25px' }}>Contacto</h2>
      <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '20px' }}>
        Si tienes alguna pregunta o sugerencia, no dudes en contactarnos.
      </p>

      {/* ¡IMPORTANTE!: Reemplaza 'tuemail@tudominio.com' con tu dirección de correo electrónico real.
        FormSubmit.co enviará los correos a esta dirección.
        También puedes ir a https://formsubmit.co/ para generar tu endpoint.
      */}
      <form
        action="https://formsubmit.co/analancommty2021@gmail.com"
        method="POST"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
      >
        <input
          type="text"
          name="name"
          placeholder="Tu Nombre"
          required
          style={{
            padding: '12px',
            borderRadius: '5px',
            border: '1px solid #00FFFF',
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            fontSize: '1em'
          }}
        />
        <input
          type="email"
          name="email"
          placeholder="Tu Email"
          required
          style={{
            padding: '12px',
            borderRadius: '5px',
            border: '1px solid #00FFFF',
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            fontSize: '1em'
          }}
        />
        <textarea
          name="message"
          placeholder="Tu Mensaje"
          required
          rows="5"
          style={{
            padding: '12px',
            borderRadius: '5px',
            border: '1px solid #00FFFF',
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            fontSize: '1em',
            resize: 'vertical'
          }}
        ></textarea>

        {/* Este input oculto es para que FormSubmit.co redirija al usuario a una página de éxito. */}
        <input type="hidden" name="_next" value="http://localhost:3000/contact-success" />
        {/* Este input oculto es para deshabilitar la página de 'reCAPTCHA' de FormSubmit (opcional, por simplicidad) */}
        <input type="hidden" name="_captcha" value="false" />


        <button
          type="submit"
          disabled={status === 'sending'}
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
            opacity: status === 'sending' ? 0.7 : 1
          }}
        >
          {status === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </form>

      {status === 'success' && (
        <p style={{ color: '#8AFFD2', marginTop: '20px', fontWeight: 'bold' }}>
          ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
        </p>
      )}
      {status === 'error' && (
        <p style={{ color: 'red', marginTop: '20px', fontWeight: 'bold' }}>
          Error al enviar el mensaje. Por favor, inténtalo de nuevo.
        </p>
      )}
    </div>
  );
};

export default ContactForm;