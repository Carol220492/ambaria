// frontend/src/store/useAudioPlayerStore.js
import { create } from 'zustand';

// Creamos la instancia del store.
// Anteriormente, esto se exportaba como un "hook" por su nombre,
// pero para la nueva estrategia de suscripción directa, necesitamos exportar la instancia del store en sí.
const audioPlayerStore = create((set) => ({
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
        // Mantenemos la referencia existente si es el mismo podcast para evitar recrearlo.
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

        // --- IMPORTANTE: COMENTADO O ELIMINADO EN ESTA VERSIÓN ---
        // La llamada directa a newAudio.play() AQUÍ se mueve al componente GlobalAudioPlayer.
        // Las acciones del store solo deben preocuparse por actualizar el estado, no manipular el DOM.
        // newAudio.play().catch(e => console.error("Error al intentar reproducir el audio:", e));

        return {
          currentPodcast: podcast,
          isPlaying: true, // Establecemos que está reproduciendo en el store
          audioElement: newAudio // Guardamos la referencia al objeto Audio
        };
      } else {
        // Si es el mismo podcast y solo se llama a playPodcast sin cambiar el tiempo
        // Solo aseguramos que el estado 'isPlaying' esté en true.
        // La lógica de reproducción se gestiona en GlobalAudioPlayer.
        // if (state.audioElement) {
        //   state.audioElement.play().catch(e => console.error("Error al reanudar la reproducción:", e));
        // }
        return { isPlaying: true };
      }
    });
  },

  // Función para pausar la reproducción
  pausePodcast: () => {
    set((state) => {
      // --- IMPORTANTE: COMENTADO O ELIMINADO EN ESTA VERSIÓN ---
      // La llamada directa a state.audioElement.pause() AQUÍ se mueve al GlobalAudioPlayer.
      // if (state.audioElement) {
      //   state.audioElement.pause();
      // }
      return { isPlaying: false }; // Establecemos que está pausado en el store
    });
  },

  // Función para alternar entre reproducir y pausar
  // Esta función puede ser redundante si el control se hace con playPodcast/pausePodcast directamente.
  // La he dejado comentada para mantener la estructura original si la necesitas en otro lugar,
  // pero para la integración del GlobalAudioPlayer, no se usa.
  togglePlayPause: () => {
    set((state) => {
      // if (state.audioElement) {
      //   if (state.isPlaying) {
      //     state.audioElement.pause();
      //   } else {
      //     state.audioElement.play().catch(e => console.error("Error al intentar reproducir:", e));
      //   }
      // }
      return { isPlaying: !state.isPlaying };
    });
  },

  // Función para detener y limpiar el reproductor
  // Renombrada de 'clearPodcast' a 'stopPodcast' para ser más descriptiva y coherente
  stopPodcast: () => { // <--- ¡RENOMBRADO AQUÍ!
    set((state) => {
      if (state.audioElement) {
        state.audioElement.pause();
        state.audioElement.src = ''; // Limpiar la fuente del audio
      }
      return { currentPodcast: null, isPlaying: false, audioElement: null };
    });
  },

  // Opcional: Para manejar eventos como el final de la canción (llamado por GlobalAudioPlayer)
  handleAudioEnded: () => {
    set({ isPlaying: false, currentPodcast: null, audioElement: null });
  },
}));

// --- ¡ESTA ES LA LÍNEA CRUCIAL DE CAMBIO! ---
// Exportamos directamente el objeto 'audioPlayerStore' creado por 'create()'.
// Esto permite a otros componentes usar audioPlayerStore.subscribe() y audioPlayerStore.getState().
export default audioPlayerStore;