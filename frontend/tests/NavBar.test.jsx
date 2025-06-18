// frontend/tests/NavBar.test.jsx
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext.jsx'; // Ruta corregida a AuthContext
import NavBar from '../src/components/NavBar.jsx'; // Ruta corregida a NavBar

// Limpia el DOM después de cada test para evitar interferencias
afterEach(() => {
  cleanup();
});

describe('NavBar Component', () => {

  // Test 1: Renderiza el nombre de la aplicación
  it('renders the application name "Ambaria"', () => {
    // Mockea el contexto para simular que no hay usuario logueado
    const mockAuthContextValue = {
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <Router> {/* NavBar usa Link, por lo que necesita Router */}
          <NavBar />
        </Router>
      </AuthContext.Provider>
    );

    // Verifica que el título "Ambaria" esté en el documento
    expect(screen.getByRole('heading', { name: /Ambaria/i })).toBeInTheDocument();
  });

  // Test 2: Renderiza los enlaces de navegación cuando no está autenticado
  it('renders login link when not authenticated', () => {
    const mockAuthContextValue = {
      isAuthenticated: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <Router>
          <NavBar />
        </Router>
      </AuthContext.Provider>
    );

    // Verifica que el enlace "Iniciar Sesión" esté presente
    expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    // Verifica que NO esté presente el botón "Cerrar Sesión"
    expect(screen.queryByRole('button', { name: /Cerrar Sesión/i })).not.toBeInTheDocument();
  });

  // Test 3: Renderiza el saludo al usuario y el botón de cerrar sesión cuando está autenticado
  it('renders user greeting and logout button when authenticated', () => {
    const mockUser = { name: 'TestUser', email: 'test@example.com', user_id: '123' };
    const mockAuthContextValue = {
      isAuthenticated: true,
      user: mockUser,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <Router>
          <NavBar />
        </Router>
      </AuthContext.Provider>
    );

    // Verifica que el saludo "Hola, TestUser!" esté presente
    expect(screen.getByText(/Hola, TestUser!/i)).toBeInTheDocument();
    // Verifica que el botón "Cerrar Sesión" esté presente
    expect(screen.getByRole('button', { name: /Cerrar Sesión/i })).toBeInTheDocument();
    // Verifica que el enlace "Iniciar Sesión" NO esté presente
    expect(screen.queryByRole('link', { name: /Iniciar Sesión/i })).not.toBeInTheDocument();
  });

  // Test 4: Verifica los enlaces de navegación adicionales
  it('renders main navigation links', () => {
    const mockAuthContextValue = { // Simula un estado autenticado para ver todos los enlaces
      isAuthenticated: true,
      user: { name: 'User' },
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockAuthContextValue}>
        <Router>
          <NavBar />
        </Router>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('link', { name: /Subir Podcast/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mi Perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contacto/i })).toBeInTheDocument();
  });

});