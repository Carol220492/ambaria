// frontend/src/components/GlobalAudioPlayer.js
import React, { useRef, useEffect, useState } from 'react';
import audioPlayerStore from '../store/useAudioPlayerStore';
import { FaPlay, FaPause } from 'react-icons/fa';

const GlobalAudioPlayer = () => {
    const audioRef = useRef(new Audio());

    const [currentPodcast, setCurrentPodcast] = useState(audioPlayerStore.getState().currentPodcast);
    const [isPlaying, setIsPlaying] = useState(audioPlayerStore.getState().isPlaying);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = audioPlayerStore.subscribe(
            (state) => {
                if (state.currentPodcast !== currentPodcast) {
                    setCurrentPodcast(state.currentPodcast);
                }
                if (state.isPlaying !== isPlaying) {
                    setIsPlaying(state.isPlaying);
                }
            },
            (prev, curr) => prev.currentPodcast === curr.currentPodcast && prev.isPlaying === curr.isPlaying
        );
        return () => unsubscribe();
    }, [currentPodcast, isPlaying]);


    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            if (!isDragging) {
                setCurrentTime(audio.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setError(null);
        };

        const handleEnded = () => {
            audioPlayerStore.getState().stopPodcast();
            setCurrentTime(0);
            setError(null);
        };

        const handleError = (e) => {
            console.error("Error de reproducción de audio:", e);
            console.error("Fuente de audio:", audio.src);
            console.error("Podcast actual en el store (en error):", audioPlayerStore.getState().currentPodcast);
            setError("Error al reproducir el audio. Intenta de nuevo.");
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [isDragging]);


    useEffect(() => {
        const audio = audioRef.current;
        console.log("DEBUG: useEffect (control playback) - currentPodcast (local):", currentPodcast, "isPlaying (local):", isPlaying);

        if (currentPodcast && currentPodcast.audio_url) {
            if (audio.src !== currentPodcast.audio_url) {
                console.log("DEBUG: Cambiando audio.src a:", currentPodcast.audio_url);
                audio.src = currentPodcast.audio_url;
                audio.load();
                setCurrentTime(0);
                setError(null);
            }

            if (isPlaying) {
                if (audio.paused || audio.ended) {
                    console.log("DEBUG: Intentando play...");
                    audio.play().catch(e => {
                        console.error("Error al intentar reproducir el audio (direct play):", e);
                        setError("No se pudo reproducir el audio automáticamente. Haz clic para reproducir.");
                    });
                }
            } else {
                console.log("DEBUG: Pausando audio.");
                audio.pause();
            }
        } else {
            console.log("DEBUG: No hay currentPodcast o audio_url. Deteniendo y limpiando.");
            audio.pause();
            audio.src = '';
            setCurrentTime(0);
            setDuration(0);
            if (isPlaying) {
                 audioPlayerStore.getState().stopPodcast();
            }
            setError(null);
        }
    }, [currentPodcast, isPlaying]);


    const handleSeek = (e) => {
        const audio = audioRef.current;
        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleMouseDown = () => {
        setIsDragging(true);
        audioRef.current.pause();
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (isPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(e => {
                console.error("Error al reanudar audio después de arrastrar:", e);
                setError("No se pudo reanudar el audio después de arrastrar.");
            });
        }
    };

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentPodcast) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            // CAMBIO: Fondo semi-transparente para el reproductor global
            backgroundColor: 'rgba(28, 28, 28, 0.8)', // Un tono oscuro con 80% de opacidad
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
            {error && <div style={{ color: 'red', fontSize: '0.9em', marginLeft: '20px' }}>{error}</div>}
        </div>
    );
};

export default GlobalAudioPlayer;