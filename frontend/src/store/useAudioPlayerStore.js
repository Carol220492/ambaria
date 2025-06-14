import { create } from 'zustand';

const useAudioPlayerStore = create((set) => ({
  currentPodcast: null, // El objeto del podcast que se está reproduciendo actualmente
  isPlaying: false,     // true si está reproduciendo, false si está en pausa
  audioElement: null,   // Referencia al elemento <audio> HTML

  // Función para cargar un podcast y comenzar la reproducción
  playPodcast: (podcast, initialTime = 0) => {
    set((state) => {
      // Si hay un podcast diferente o queremos reproducir el mismo desde el principio
      if (!state.currentPodcast || state.currentPodcast.id !== podcast.id || initialTime === 0) {
        if (state.audioElement) {
          state.audioElement.pause(); // Pausar el anterior si existe
        }
        // Crear una nueva instancia de Audio si no existe o es un podcast diferente
        const newAudio = state.audioElement && state.currentPodcast.id === podcast.id
                         ? state.audioElement
                         : new Audio(podcast.audio_url);

        // Si el podcast es diferente, resetear el tiempo
        if (!state.currentPodcast || state.currentPodcast.id !== podcast.id) {
            newAudio.currentTime = 0;
        } else {
            // Si es el mismo podcast, mantener el tiempo actual o ir a initialTime
            newAudio.currentTime = initialTime;
        }

        newAudio.play().catch(e => console.error("Error al intentar reproducir el audio:", e));

        return { 
          currentPodcast: podcast, 
          isPlaying: true, 
          audioElement: newAudio 
        };
      } else {
        // Si es el mismo podcast y solo se llama a playPodcast sin cambiar el tiempo
        // Asegurarse de que esté reproduciendo
        if (state.audioElement) {
          state.audioElement.play().catch(e => console.error("Error al reanudar la reproducción:", e));
        }
        return { isPlaying: true };
      }
    });
  },

  // Función para pausar la reproducción
  pausePodcast: () => {
    set((state) => {
      if (state.audioElement) {
        state.audioElement.pause();
      }
      return { isPlaying: false };
    });
  },

  // Función para alternar entre reproducir y pausar
  togglePlayPause: () => {
    set((state) => {
      if (state.audioElement) {
        if (state.isPlaying) {
          state.audioElement.pause();
        } else {
          state.audioElement.play().catch(e => console.error("Error al intentar reproducir:", e));
        }
      }
      return { isPlaying: !state.isPlaying };
    });
  },

  // Función para limpiar el reproductor (por ejemplo, al cerrar sesión)
  clearPodcast: () => {
    set((state) => {
      if (state.audioElement) {
        state.audioElement.pause();
        state.audioElement.src = ''; // Limpiar la fuente del audio
      }
      return { currentPodcast: null, isPlaying: false, audioElement: null };
    });
  },

  // Opcional: Para manejar eventos como el final de la canción
  handleAudioEnded: () => {
    set({ isPlaying: false, currentPodcast: null, audioElement: null });
  },
}));

export default useAudioPlayerStore;