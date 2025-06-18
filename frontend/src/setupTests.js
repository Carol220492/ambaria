// frontend/src/setupTests.js
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest'; // Importar vi

// *** MOCK DE LOCALSTORAGE Y SESSIONSTORAGE GLOBALMENTE ***
const localStorageMockStore = {};

vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => localStorageMockStore[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMockStore[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMockStore[key];
  }),
  clear: vi.fn(() => {
    for (const key in localStorageMockStore) {
      delete localStorageMockStore[key];
    }
  }),
});

vi.stubGlobal('sessionStorage', {
  getItem: vi.fn((key) => localStorageMockStore[key] || null), // O un store separado si lo necesitas
  setItem: vi.fn((key, value) => {
    localStorageMockStore[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMockStore[key];
  }),
  clear: vi.fn(() => {
    for (const key in localStorageMockStore) {
      delete localStorageMockStore[key];
    }
  }),
});

// *** MOCK DE WINDOW.ALERT Y WINDOW.CONFIRM PARA EVITAR POP-UPS EN TESTS ***
vi.stubGlobal('alert', vi.fn());
vi.stubGlobal('confirm', vi.fn(() => true)); // Por defecto, confirma cualquier prompt