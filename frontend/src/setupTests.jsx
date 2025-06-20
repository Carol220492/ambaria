// frontend/src/setupTests.jsx
import '@testing-library/jest-dom/vitest';
import { vi, beforeEach, afterEach } from 'vitest';
import React from 'react'; // Necesario para JSX en los mocks si se usan

// --- MOCK GLOBAL DE useNavigate ---
const mockNavigateFn = vi.fn(); // Definimos el mock para useNavigate una vez
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigateFn, // Aseguramos que useNavigate devuelva siempre esta instancia
    BrowserRouter: actual.BrowserRouter,
    Link: actual.Link,
  };
});

// --- MOCK GLOBAL DE AXIOS ---
// Aseguramos que Axios siempre se mockee con vi.fn() para sus métodos clave,
// haciendo que sean reseteables.
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
      interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() }
      }
    })),
  },
}));

// --- MOCK DE LOCALSTORAGE Y SESSIONSTORAGE GLOBALMENTE ---
let mockStore = {};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn((key) => mockStore[key] || null),
    setItem: vi.fn((key, value) => {
      mockStore[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete mockStore[key];
    }),
    clear: vi.fn(() => {
      mockStore = {};
    }),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn((key) => mockStore[key] || null),
    setItem: vi.fn((key, value) => {
      mockStore[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete mockStore[key];
    }),
    clear: vi.fn(() => {
      mockStore = {};
    }),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// --- MOCK DE WINDOW.ALERT Y WINDOW.CONFIRM PARA EVITAR POP-UPS ---
vi.stubGlobal('alert', vi.fn());
vi.stubGlobal('confirm', vi.fn(() => true));


// --- MOCK GLOBAL DE FETCH (LA ESTRATEGIA MÁS DIRECTA) ---
// Definimos directamente global.fetch como una instancia de vi.fn()
// Esto asegura que siempre será un mock que soporte .mockResolvedValueOnce
global.fetch = vi.fn(async (url, options) => {
  // Implementación por defecto si no hay un mock específico para la llamada
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    headers: new Headers(),
    clone: vi.fn(() => ({ ...this })),
  };
});


// --- Hooks para antes y después de cada test ---
beforeEach(() => {
  vi.useFakeTimers(); // Aseguramos que los timers falsos están activos

  // Limpia el mock de localStorage antes de cada test
  window.localStorage.clear();
  window.sessionStorage.clear();

  // Limpia y restablece los mocks relevantes
  // Como global.fetch ya es vi.fn(), podemos usar sus métodos de limpieza directamente
  global.fetch.mockClear();    // Limpia el historial de llamadas de fetch
  global.fetch.mockReset();    // Resetea las implementaciones de mock (.mockResolvedValueOnce etc.)

  // Después de mockReset, la implementación de `global.fetch` vuelve a la definida arriba.
  // Es importante que la definición global con vi.fn(...) ya esté en su lugar.

  mockNavigateFn.mockClear();
  mockNavigateFn.mockReset(); 

  // Limpiamos TODAS las llamadas de TODOS los mocks (`vi.fn()` y `vi.mock`d).
  vi.clearAllMocks(); 
  // No usamos vi.resetAllMocks() aquí para evitar deshacer nuestra configuración global de fetch.
});

afterEach(() => {
  vi.useRealTimers(); // Restaura los timers reales
  // No restauramos `global.fetch` aquí porque queremos que se mantenga como `vi.fn()` entre tests.
  // `mockClear()` y `mockReset()` en `beforeEach` lo gestionan.
  // vi.restoreAllMocks() puede ser demasiado agresivo y "desmockear" cosas que no queremos.
  // Si algo falla, podríamos añadir vi.restoreAllMocks() aquí, pero por ahora lo omitimos.
});