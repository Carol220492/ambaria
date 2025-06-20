// frontend/tests/podcastUtils.test.js
import { describe, it, expect } from 'vitest';
import { getUniqueCategories } from '../src/utils/podcastUtils.js'; // Asegúrate de que la ruta sea correcta

describe('getUniqueCategories', () => {
  // Test 1: Devuelve 'All' si no hay podcasts o el array está vacío
  it('should return ["All"] for an empty or null array of podcasts', () => {
    expect(getUniqueCategories([])).toEqual(['All']);
    expect(getUniqueCategories(null)).toEqual(['All']);
    expect(getUniqueCategories(undefined)).toEqual(['All']);
  });

  // Test 2: Extrae categorías únicas y las ordena alfabéticamente (después de 'All')
  it('should extract unique categories and sort them alphabetically, including "All"', () => {
    const podcasts = [
      { id: '1', category: 'Comedy' },
      { id: '2', category: 'Technology' },
      { id: '3', category: 'Comedy' },
      { id: '4', category: 'Science' },
      { id: '5', category: 'Technology' },
    ];
    expect(getUniqueCategories(podcasts)).toEqual(['All', 'Comedy', 'Science', 'Technology']);
  });

  // Test 3: Maneja podcasts sin la propiedad 'category'
  it('should ignore podcasts without a category property', () => {
    const podcasts = [
      { id: '1', category: 'Music' },
      { id: '2', title: 'No Category' }, // Sin categoría
      { id: '3', category: 'Sport' },
    ];
    expect(getUniqueCategories(podcasts)).toEqual(['All', 'Music', 'Sport']);
  });

  // Test 4: Maneja categorías con valores nulos o indefinidos
  it('should ignore podcasts with null or undefined category values', () => {
    const podcasts = [
      { id: '1', category: 'Arts' },
      { id: '2', category: null }, // Categoría nula
      { id: '3', category: undefined }, // Categoría indefinida
      { id: '4', category: 'Business' },
    ];
    expect(getUniqueCategories(podcasts)).toEqual(['All', 'Arts', 'Business']);
  });

  // Test 5: Maneja una única categoría
  it('should correctly handle a single unique category', () => {
    const podcasts = [
      { id: '1', category: 'News' },
      { id: '2', category: 'News' },
    ];
    expect(getUniqueCategories(podcasts)).toEqual(['All', 'News']);
  });

  // Test 6: Maneja categorías con nombres especiales (que no sean solo letras)
  it('should handle categories with special characters or numbers', () => {
    const podcasts = [
      { id: '1', category: 'Q&A' },
      { id: '2', category: 'Top 10' },
      { id: '3', category: 'Q&A' },
    ];
    expect(getUniqueCategories(podcasts)).toEqual(['All', 'Q&A', 'Top 10']);
  });
});