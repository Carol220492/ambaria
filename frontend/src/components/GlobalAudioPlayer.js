// frontend/src/components/GlobalAudioPlayer.js
import React, { useRef, useEffect, useState } from 'react';
// Importamos directamente la instancia del store, no el hook `useAudioPlayerStore`
import audioPlayerStore from '../store/useAudioPlayerStore';
import { FaPlay, FaPause } from 'react-icons/fa';

const GlobalAudioPlayer = () => {
    // Usamos useRef para mantener la instancia del objeto Audio persistente.
    const audioRef = useRef(new Audio());

    // Estados locales que reflejarán el estado del store de Zustand.
    // Inicializamos con el estado actual del store.
    const [currentPodcast, setCurrentPodcast] = useState(audioPlayerStore.getState().currentPodcast);
    const [isPlaying, setIsPlaying] = useState(audioPlayerStore.getState().isPlaying);

    // Estados locales para el progreso de la reproducción y errores.
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false); // Para controlar el arrastre del slider
    const [error, setError] = useState(null); // Estado para manejar errores de reproducción

    // Primer useEffect: Se suscribe a los cambios del store de Zustand.
    // Se ejecuta al montar y limpia la suscripción al desmontar el componente.
    useEffect(() => {
        // La función `subscribe` de Zustand nos permite escuchar cambios en el store.
        // El segundo argumento es una función de comparación para decidir cuándo notificar.
        const unsubscribe = audioPlayerStore.subscribe(
            (state) => {
                // Actualizamos los estados locales solo si el valor en el store ha cambiado.
                // Esto es clave para evitar re-renders innecesarios y bucles.
                if (state.currentPodcast !== currentPodcast) {
                    setCurrentPodcast(state.currentPodcast);
                }
                if (state.isPlaying !== isPlaying) {
                    setIsPlaying(state.isPlaying);
                }
            },
            // Función de comparación profunda para `currentPodcast` y `isPlaying`.
            // Asegura que solo se re-renderice si estos valores cambian.
            (prev, curr) => prev.currentPodcast === curr.currentPodcast && prev.isPlaying === curr.isPlaying
        );

        // La función de retorno de `useEffect` es para la limpieza (unsubscribe).
        return () => unsubscribe();
    }, [currentPodcast, isPlaying]); // Dependencias: los estados locales que se actualizan mediante la suscripción.


    // Segundo useEffect: Sincroniza eventos del objeto Audio con estados locales y store.
    // Maneja `timeupdate`, `loadedmetadata`, `ended` y `error` del audio HTML.
    useEffect(() => {
        const audio = audioRef.current; // Obtiene la referencia al elemento Audio.

        // Manejador para actualizar el tiempo actual de reproducción.
        const handleTimeUpdate = () => {
            if (!isDragging) { // Solo actualiza si el usuario no está arrastrando el slider.
                setCurrentTime(audio.currentTime);
            }
        };

        // Manejador para establecer la duración del podcast una vez cargados los metadatos.
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setError(null); // Limpiar cualquier error previo al cargar un nuevo audio.
        };

        // Manejador cuando el audio termina de reproducirse.
        const handleEnded = () => {
            audioPlayerStore.getState().stopPodcast(); // Llama a la acción `stopPodcast` del store.
            setCurrentTime(0); // Reinicia el tiempo.
            setError(null); // Limpia errores.
        };

        // Manejador de errores del objeto Audio (ej. archivo no encontrado, formato no soportado).
        const handleError = (e) => {
            console.error("Error de reproducción de audio:", e);
            console.error("Fuente de audio:", audio.src);
            console.error("Podcast actual en el store (en error):", audioPlayerStore.getState().currentPodcast);
            setError("Error al reproducir el audio. Intenta de nuevo.");
        };

        // Añade los event listeners al objeto Audio.
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        // Función de limpieza: Remueve los event listeners al desmontar el componente.
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [isDragging]); // Dependencias: 'isDragging' y 'audioPlayerStore' (ya que sus métodos son estables).


    // Tercer useEffect: Controla la reproducción/pausa real del objeto Audio
    // en respuesta a los cambios en `currentPodcast` e `isPlaying` (estados locales).
    useEffect(() => {
        const audio = audioRef.current;
        console.log("DEBUG: useEffect (control playback) - currentPodcast (local):", currentPodcast, "isPlaying (local):", isPlaying);

        // Si hay un podcast seleccionado y su URL de audio es válida
        if (currentPodcast && currentPodcast.audio_url) {
            // Cargar la fuente del audio solo si ha cambiado o no está establecida.
            if (audio.src !== currentPodcast.audio_url) {
                console.log("DEBUG: Cambiando audio.src a:", currentPodcast.audio_url);
                audio.src = currentPodcast.audio_url;
                audio.load(); // Vuelve a cargar el audio para la nueva fuente.
                setCurrentTime(0); // Reinicia el tiempo al cambiar de podcast.
                setError(null); // Limpia errores.
            }

            // Si el estado 'isPlaying' indica que el audio debe estar reproduciéndose...
            if (isPlaying) {
                // Solo intenta reproducir si el audio está pausado o ha terminado (para evitar llamadas redundantes a play()).
                if (audio.paused || audio.ended) {
                    console.log("DEBUG: Intentando play...");
                    audio.play().catch(e => {
                        console.error("Error al intentar reproducir el audio (direct play):", e);
                        setError("No se pudo reproducir el audio automáticamente. Haz clic para reproducir.");
                    });
                }
            } else {
                // Si el estado 'isPlaying' indica que el audio debe estar pausado, pausa el audio.
                console.log("DEBUG: Pausando audio.");
                audio.pause();
            }
        } else {
            // Si no hay `currentPodcast` o `audio_url` válida, detiene y limpia el reproductor.
            console.log("DEBUG: No hay currentPodcast o audio_url. Deteniendo y limpiando.");
            audio.pause();
            audio.src = '';
            setCurrentTime(0);
            setDuration(0);
            // Si el audio estaba en modo 'playing' antes de quedarse sin podcast, detiene el estado en el store.
            if (isPlaying) {
                 audioPlayerStore.getState().stopPodcast(); // Llama a la acción del store.
            }
            setError(null); // Limpia errores.
        }
    }, [currentPodcast, isPlaying]); // Dependencias: los estados locales `currentPodcast` e `isPlaying`.


    // Manejador para el cambio en el slider de progreso.
    const handleSeek = (e) => {
        const audio = audioRef.current;
        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // Manejador para el inicio del arrastre del slider (pausa el audio).
    const handleMouseDown = () => {
        setIsDragging(true);
        audioRef.current.pause();
    };

    // Manejador para el final del arrastre del slider (reanuda si estaba reproduciéndose).
    const handleMouseUp = () => {
        setIsDragging(false);
        // Si el audio estaba en modo 'playing' según el store y fue pausado por el arrastre, reanuda.
        if (isPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(e => {
                console.error("Error al reanudar audio después de arrastrar:", e);
                setError("No se pudo reanudar el audio después de arrastrar.");
            });
        }
    };

    // Función auxiliar para formatear el tiempo de segundos a "MM:SS".
    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // No renderiza el reproductor si no hay ningún podcast seleccionado para reproducir.
    if (!currentPodcast) {
        return null;
    }

    // Renderiza el componente del reproductor de audio.
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#1c1c1c',
            color: 'white',
            padding: '10px 20px',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={currentPodcast.cover_image_url || 'https://placehold.co/50x50/000/FFF?text=Podcast'}
                    alt="Podcast Cover"
                    style={{ width: '50px', height: '50px', borderRadius: '5px', marginRight: '15px', objectFit: 'cover' }}
                />
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.1em', color: '#8AFFD2' }}>{currentPodcast.title}</h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#bbb' }}>{currentPodcast.artist}</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Botón de reproducción/pausa: Llama a las acciones del store directamente. */}
                <button onClick={() => isPlaying ? audioPlayerStore.getState().pausePodcast() : audioPlayerStore.getState().playPodcast(currentPodcast)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5em', cursor: 'pointer' }}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1, maxWidth: '400px' }}>
                <span style={{ fontSize: '0.9em', color: '#bbb' }}>{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    style={{
                        width: '100%',
                        height: '5px',
                        background: `linear-gradient(to right, #cc00cc 0%, #cc00cc ${(currentTime / duration) * 100}%, #555 ${(currentTime / duration) * 100}%, #555 100%)`,
                        borderRadius: '5px',
                        cursor: 'pointer',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        outline: 'none',
                    }}
                />
                <span style={{ fontSize: '0.9em', color: '#bbb' }}>{formatTime(duration)}</span>
            </div>
            {/* Mostrar mensaje de error si existe */}
            {error && <div style={{ color: 'red', fontSize: '0.9em', marginLeft: '20px' }}>{error}</div>}
        </div>
    );
};

export default GlobalAudioPlayer;