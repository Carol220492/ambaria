// frontend/src/components/VideoBackground.js
import React from 'react';
import ambariaVideo from '../assets/ambaria.mp4'; // <--- ¡IMPORTA TU VIDEO AQUÍ!

const VideoBackground = () => {
  // La URL del video se obtiene directamente de la importación.
  // Webpack se encarga de procesar el archivo y darle una URL accesible.
  const videoSrc = ambariaVideo;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      zIndex: -1, // Envía el video al fondo, detrás de todo el contenido
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000' // Color de fondo de respaldo si el video no carga
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline // Importante para iOS, permite la reproducción automática sin interacción
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover' // Cubre todo el div, recortando si es necesario
        }}
        // Puedes añadir un `poster` para una imagen de carga o fallback
        // Por ejemplo, si tienes una imagen `placeholder.jpg` en `../assets`
        // poster={require('../assets/placeholder.jpg').default}
      >
        <source src={videoSrc} type="video/mp4" />
        Tu navegador no soporta el tag de video.
      </video>
    </div>
  );
};

export default VideoBackground;