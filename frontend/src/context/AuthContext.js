import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de tener 'jwt-decode' instalado: npm install jwt-decode

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Almacenará { user_id, email, profile_picture }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Verificar si el token ha expirado
        if (decodedToken.exp * 1000 > Date.now()) { // exp está en segundos, Date.now() en milisegundos
          setUser({
            user_id: decodedToken.sub, // 'sub' es la identidad que configuramos en Flask (user.id)
            email: decodedToken.email,
            profile_picture: decodedToken.profile_picture,
            name: decodedToken.name || decodedToken.email // Añadir nombre si está disponible en el token
          });
          setIsAuthenticated(true);
        } else {
          // Token expirado
          localStorage.removeItem('jwt_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error('Error decodificando el token:', e);
        localStorage.removeItem('jwt_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    try {
      const decodedToken = jwtDecode(token);
      setUser({
        user_id: decodedToken.sub,
        email: decodedToken.email,
        profile_picture: decodedToken.profile_picture,
        name: decodedToken.name || decodedToken.email
      });
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Error al decodificar el token JWT al iniciar sesión:', e);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    setIsAuthenticated(false);
    // Puedes redirigir al usuario aquí si lo deseas
  };

  if (loading) {
    return null; // O un spinner de carga
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};