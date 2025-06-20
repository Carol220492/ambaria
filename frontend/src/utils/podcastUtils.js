// frontend/src/utils/podcastUtils.js

/**
 * Extrae y devuelve una lista de categorías únicas de un array de podcasts.
 * Incluye 'All' como la primera opción.
 * @param {Array<Object>} podcasts El array de objetos podcast. Cada objeto debe tener una propiedad 'category'.
 * @returns {Array<string>} Un array de strings con las categorías únicas, empezando por 'All'.
 */
export function getUniqueCategories(podcasts) {
  if (!podcasts || podcasts.length === 0) {
    return ['All'];
  }

  const categories = new Set();
  podcasts.forEach(podcast => {
    if (podcast.category) {
      categories.add(podcast.category);
    }
  });

  return ['All', ...Array.from(categories).sort()];
}