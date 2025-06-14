import React, { useEffect, useRef, useState } from 'react';
import useAudioPlayerStore from '../store/useAudioPlayerStore'; // Importar el store
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa'; // Iconos

const GlobalAudioPlayer = () => {
  // Acceder al estado y acciones del store de Zustand
  const { currentPodcast, isPlaying, playPodcast, pausePodcast, togglePlayPause, clearPodcast, audioElement } = useAudioPlayerStore();

  const audioRef = useRef(null); // Usaremos esta ref para el elemento <audio> local en este componente
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Sincronizar el elemento de audio del store con la ref local
  // y adjuntar listeners de eventos
  useEffect(() => {
    if (audioElement) {
      audioRef.current = audioElement;

      const updateTime = () => setCurrentTime(audioRef.current.currentTime);
      const updateDuration = () => setDuration(audioRef.current.duration);
      const handleEnded = () => clearPodcast(); // Limpiar cuando termina

      audioRef.current.addEventListener('timeupdate', updateTime);
      audioRef.current.addEventListener('loadedmetadata', updateDuration);
      audioRef.current.addEventListener('ended', handleEnded);

      // Limpiar listeners al desmontar o cambiar el elemento de audio
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updateTime);
          audioRef.current.removeEventListener('loadedmetadata', updateDuration);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [audioElement, clearPodcast]); // Dependencias: re-ejecutar si el elemento de audio cambia

  // Controlar la reproducción/pausa basada en el estado de Zustand
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error al reproducir desde effect:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]); // Dependencias: re-ejecutar si isPlaying cambia

  // Formatear el tiempo para mostrarlo (MM:SS)
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `<span class="math-inline">\{minutes\.toString\(\)\.padStart\(2, '0'\)\}\:</span>{seconds.toString().padStart(2, '0')}`;
  };

  // Manejar el cambio en la barra de progreso
  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (!currentPodcast) {
    return null; // No mostrar el reproductor si no hay ningún podcast cargado
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#1a1a40', // Fondo oscuro
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 -2px 10px rgba(0, 255, 255, 0.5)', // Sombra con brillo neón
      zIndex: 1000 // Asegura que esté por encima de otros elementos
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <img 
            src={currentPodcast.cover_image_url || 'default_podcast_cover.jpg'} 
            alt={currentPodcast.title} 
            style={{ width: '50px', height: '50px', borderRadius: '5px', marginRight: '15px', objectFit: 'cover' }} 
        />
        <div style={{ color: 'white', maxWidth: 'calc(100% - 250px)' }}> {/* Ajustado maxWidth */}
          <h4 style={{ margin: 0, color: '#00FFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentPodcast.title}</h4>
          <p style={{ margin: 0, fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.7)' }}>{currentPodcast.artist}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0, margin: '0 20px' }}>
        {/* Controles: Solo Play/Pause por ahora. Next/Prev se añadirán con una playlist. */}
        <button
          onClick={togglePlayPause}
          style={{
            background: 'none',
            border: 'none',
            color: '#E6B3FF', // Color de acento
            fontSize: '1.8em',
            cursor: 'pointer',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px'
          }}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      <div style={{ flexGrow: 2, display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}> {/* Barra de progreso */}
        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9em' }}>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          style={{
            flexGrow: 1,
            height: '5px',
            borderRadius: '5px',
            background: `linear-gradient(to right, #00FFFF ${ (currentTime / duration * 100) || 0 }%, #555 ${ (currentTime / duration * 100) || 0 }%)`, // Barra de progreso con color
            outline: 'none',
            cursor: 'pointer',
            // Estilos para el "pulgar" del slider
            WebkitAppearance: 'none',
            appearance: 'none',
            '::WebkitSliderThumb': {
                WebkitAppearance: 'none',
                appearance: 'none',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: '#E6B3FF',
                cursor: 'pointer',
                boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
            },
            '::-moz-range-thumb': {
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: '#E6B3FF',
                cursor: 'pointer',
                boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
            }
          }}
        />
        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9em' }}>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;