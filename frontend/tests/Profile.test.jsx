// frontend/tests/Profile.test.jsx
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'; // Asegúrate de importar fireEvent
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import Profile from '../src/components/Profile.jsx';
import { AuthContext } from '../src/context/AuthContext.jsx';
import axios from 'axios';

// *** MOCKS GLOBALES PARA EL ARCHIVO DE TEST ***
// Mockea axios para que todas sus llamadas puedan ser controladas
vi.mock('axios');

// Mockea localStorage con vi.stubGlobal
const localStorageMockStore = {}; // Un objeto para simular el almacenamiento
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

// Mockea window.alert y window.confirm para evitar pop-ups en tests
vi.stubGlobal('alert', vi.fn());
vi.stubGlobal('confirm', vi.fn(() => true));

// *** MOCK GLOBAL DE useNavigate ***
// Se mockea el módulo react-router-dom una vez, y se espía useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate, // Siempre devuelve la misma función mock
  };
});
// *** FIN MOCKS GLOBALES ***


// Limpia el DOM y los mocks después de cada test
afterEach(() => {
  cleanup();
  vi.clearAllMocks(); // Limpia todos los mocks de vi (incluyendo axios, localStorage, y mockNavigate)
  localStorage.clear(); // Asegúrate de limpiar el localStorage mockeado
  mockNavigate.mockClear(); // Limpia las llamadas al mock de navigate
});

// Mockea las variables de entorno si Profile las usa
vi.stubEnv('VITE_API_URL', 'http://localhost:5000');


// Mocks de datos de ejemplo
const mockUserData = {
  user_id: 'test-user-123',
  name: 'Usuario Prueba',
  email: 'usuario.prueba@example.com',
  profile_picture: null,
};

const mockUserPodcasts = [
  {
    id: 'pod-1',
    title: 'Mi Primer Podcast',
    artist: 'Usuario Prueba',
    description: 'Una descripción genial del podcast.',
    audio_url: 'http://localhost:5000/audio/podcast1.mp3',
    cover_image_url: 'http://localhost:5000/covers/podcast1.jpg',
    category: 'Tecnología'
  },
  {
    id: 'pod-2',
    title: 'Podcast de Viajes',
    artist: 'Usuario Prueba',
    description: 'Explorando el mundo con sonidos.',
    audio_url: 'http://localhost:5000/audio/podcast2.mp3',
    cover_image_url: 'http://localhost:5000/covers/podcast2.jpg',
    category: 'Viajes'
  },
];


describe('Profile Component', () => {

  // Test 1: Muestra el estado de carga
  it('renders loading state initially', async () => {
    localStorage.getItem.mockReturnValueOnce('mock_jwt_token'); 
    axios.get.mockImplementation(() => new Promise(() => {})); // Que las llamadas axios nunca se resuelvan para simular carga

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, user: mockUserData, login: vi.fn(), logout: vi.fn() }}>
        <Router>
          <Profile />
        </Router>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Cargando perfil.../i)).toBeInTheDocument();
  });

  // Test 2: Muestra mensaje de error si no hay token de autenticación
  it('renders error message if no authentication token', async () => {
    localStorage.getItem.mockReturnValueOnce(null); 

    render(
      <AuthContext.Provider value={{ isAuthenticated: false, user: null, login: vi.fn(), logout: vi.fn() }}>
        <Router>
          <Profile />
        </Router>
      </AuthContext.Provider>
    );

    await waitFor(() => {
        expect(screen.getByText(/No hay token de autenticación. Por favor, inicia sesión./i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Ir a Iniciar Sesión/i })).toBeInTheDocument();
  });

  // Test 3: Muestra el perfil del usuario y "no podcasts" si no hay podcasts
  it('renders user profile and "no podcasts" message when authenticated but no podcasts', async () => {
    localStorage.getItem.mockReturnValueOnce('mock_jwt_token'); 
    axios.get
      .mockResolvedValueOnce({ data: mockUserData }) 
      .mockResolvedValueOnce({ data: { podcasts: [] } }); 

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, user: mockUserData, login: vi.fn(), logout: vi.fn() }}>
        <Router>
          <Profile />
        </Router>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument();
      expect(screen.getByText(mockUserData.email)).toBeInTheDocument(); 
      expect(screen.getByText(/Aún no has subido ningún podcast./i)).toBeInTheDocument(); 
    });
  });

  // Test 4: Muestra el perfil del usuario y la lista de podcasts
  it('renders user profile and list of podcasts when authenticated and has podcasts', async () => {
    localStorage.getItem.mockReturnValueOnce('mock_jwt_token'); 
    axios.get
      .mockResolvedValueOnce({ data: mockUserData }) 
      .mockResolvedValueOnce({ data: { podcasts: mockUserPodcasts } }); 

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, user: mockUserData, login: vi.fn(), logout: vi.fn() }}>
        <Router>
          <Profile />
        </Router>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument();
      expect(screen.getByText(mockUserData.email)).toBeInTheDocument();
      expect(screen.getByText(/Mis Podcasts Subidos/i)).toBeInTheDocument();
    });

    for (const podcast of mockUserPodcasts) {
      await waitFor(() => { 
        expect(screen.getByText(podcast.title)).toBeInTheDocument();
        expect(screen.getByText(`Artista: ${podcast.artist}`)).toBeInTheDocument();
        expect(screen.getByText(podcast.description)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Eliminar/i })).toBeInTheDocument();
      });
    }
  });

  // Test de manejo de error al cargar perfil (simulando 401/422)
  it('redirects to login on 401/422 error when fetching profile', async () => {
    localStorage.getItem.mockReturnValueOnce('invalid_token');

    axios.get.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Token inválido' } }
    });

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, user: mockUserData, login: vi.fn(), logout: vi.fn() }}>
        <Router>
          <Profile />
        </Router>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  // Test de manejo de error al cargar podcasts (simulando 401/422)
  it('redirects to login on 401/422 error when fetching user podcasts', async () => {
    localStorage.getItem.mockReturnValueOnce('mock_jwt_token');

    axios.get
      .mockResolvedValueOnce({ data: mockUserData }) 
      .mockRejectedValueOnce({ 
        response: { status: 401, data: { message: 'Sesión expirada' } }
      });

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, user: mockUserData, login: vi.fn(), logout: vi.fn() }}>
        <Router>
          <Profile />
        </Router>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });


  // Test para handle delete podcast
  it('calls handleDeletePodcast and removes podcast from list', async () => {
    localStorage.getItem.mockReturnValueOnce('mock_jwt_token');

    axios.get
      .mockResolvedValueOnce({ data: mockUserData })
      .mockResolvedValueOnce({ data: { podcasts: mockUserPodcasts } });

    axios.delete.mockResolvedValueOnce({ status: 200, data: { message: 'Podcast eliminado con éxito.' } });

    render(
      <AuthContext.Provider value={{ isAuthenticated: true, user: mockUserData, login: vi.fn(), logout: vi.fn() }}>
        <Router>
          <Profile />
        </Router>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Mi Primer Podcast')).toBeInTheDocument();
    });

    // Asegúrate de que window.confirm esté mockeado para devolver true
    window.confirm.mockReturnValue(true); 

    const deleteButton = screen.getAllByRole('button', { name: /Eliminar/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar este podcast? Esta acción no se puede deshacer.');
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:5000/podcasts/pod-1', expect.any(Object)); // Verifica la llamada a delete
      expect(window.alert).toHaveBeenCalledWith('Podcast eliminado con éxito.');
      expect(screen.queryByText('Mi Primer Podcast')).not.toBeInTheDocument(); // Verifica que el podcast ya no esté
    });
  });
});