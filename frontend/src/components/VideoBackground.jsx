// frontend/src/components/VideoBackground.js
import React, { useRef, useEffect } from 'react';
import ambariaVideo from '../assets/ambaria.mp4'; // <--- ¡ASEGÚRATE DE QUE ESTA RUTA ES CORRECTA!

const VideoBackground = () => {
  const videoRef = useRef(null); // Usamos useRef para acceder al elemento de video
  const videoSrc = ambariaVideo;

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      const handleVideoEnded = () => {
        // Cuando el video termina (el evento 'ended' se dispara)
        // Reiniciamos el tiempo de reproducción a 0 y lo volvemos a reproducir
        // Esto refuerza el atributo 'loop' y a veces suaviza el reinicio
        videoElement.currentTime = 0;
        videoElement.play().catch(e => console.error("Error al reiniciar video de fondo:", e));
      };

      videoElement.addEventListener('ended', handleVideoEnded);

      // Limpia el event listener cuando el componente se desmonte
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnded);
      };
    }
  }, []); // El efecto se ejecuta solo una vez al montar el componente

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
        ref={videoRef} // Asocia el useRef al elemento de video
        autoPlay
        loop // Volvemos a usar el atributo loop para la gestión nativa del navegador
        muted
        playsInline // Importante para iOS, permite la reproducción automática sin interacción
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover' // Cubre todo el div, recortando si es necesario
        }}
        // Puedes añadir un `poster` para una imagen de carga o fallback
        // poster={require('../assets/placeholder.jpg').default}
      >
        <source src={videoSrc} type="video/mp4" />
        Tu navegador no soporta el tag de video.
      </video>
    </div>
  );
};

export default VideoBackground;