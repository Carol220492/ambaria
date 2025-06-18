// frontend/tests/Home.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import Home from '../src/components/Home.jsx';
// *** CAMBIO DE RUTA AQUÍ: ahora va a 'src/context' ***
import { AuthContext } from '../src/context/AuthContext.jsx'; 

// Mockea el contexto de autenticación para los tests
const mockAuthContextValue = {
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
};

// Mockea las variables de entorno si Home las usa
vi.stubEnv('VITE_API_URL', 'http://localhost:5000');
// Si Home usa GOOGLE_CLIENT_ID, mockéalo también
// vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-google-client-id');

describe('Home Component', () => {
  it('renders the welcome message', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <Router>
          <Home />
        </Router>
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Bienvenido a Ambaria/i)).toBeInTheDocument();
  });

  it('renders the Google login button', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <Router>
          <Home />
        </Router>
      </AuthContext.Provider>
    );
    expect(screen.getByRole('button', { name: /Iniciar Sesión con Google/i })).toBeInTheDocument();
  });

  it('renders the privacy policy link', () => {
    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <Router>
          <Home />
        </Router>
      </AuthContext.Provider>
    );
    expect(screen.getByText(/Política de Privacidad/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Política de Privacidad/i })).toHaveAttribute('href', '/privacy');
  });
});