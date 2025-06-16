// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de tener 'jwt-decode' instalado: npm install jwt-decode

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Almacenará { user_id, email, profile_picture }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AUTHCONTEXT: Ejecutando useEffect de inicialización.");
    const token = localStorage.getItem('jwt_token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("AUTHCONTEXT: Token JWT decodificado:", decodedToken);

        // Verificar si el token ha expirado
        // decodedToken.exp está en segundos, Date.now() en milisegundos
        if (decodedToken.exp * 1000 > Date.now()) {
          const userDataFromToken = {
            user_id: decodedToken.sub, // 'sub' es la identidad que configuramos en Flask (user.id)
            email: decodedToken.email,
            profile_picture: decodedToken.profile_picture,
            name: decodedToken.name || decodedToken.email // Añadir nombre si está disponible en el token
          };
          setUser(userDataFromToken);
          setIsAuthenticated(true);
          console.log("AUTHCONTEXT: Usuario establecido en el contexto:", userDataFromToken);
        } else {
          // Token expirado
          console.log("AUTHCONTEXT: Token JWT expirado. Eliminando de localStorage.");
          localStorage.removeItem('jwt_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error('AUTHCONTEXT: Error decodificando el token JWT:', e);
        localStorage.removeItem('jwt_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      console.log("AUTHCONTEXT: No se encontró token JWT en localStorage.");
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
    console.log("AUTHCONTEXT: Inicialización completa.");
  }, []); // El array de dependencias vacío asegura que se ejecuta solo una vez al montar

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    try {
      const decodedToken = jwtDecode(token);
      const userDataFromToken = {
        user_id: decodedToken.sub,
        email: decodedToken.email,
        profile_picture: decodedToken.profile_picture,
        name: decodedToken.name || decodedToken.email
      };
      setUser(userDataFromToken);
      setIsAuthenticated(true);
      console.log("AUTHCONTEXT: Login exitoso, usuario establecido:", userDataFromToken);
    } catch (e) {
      console.error('AUTHCONTEXT: Error al decodificar el token JWT al iniciar sesión:', e);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    console.log("AUTHCONTEXT: Realizando logout.");
    localStorage.removeItem('jwt_token');
    setUser(null);
    setIsAuthenticated(false);
    // Puedes redirigir al usuario aquí si lo deseas
  };

  if (loading) {
    // Puedes renderizar un spinner o un componente de carga aquí si lo deseas
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};