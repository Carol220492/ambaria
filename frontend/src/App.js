// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import AuthHandler from './components/AuthHandler';
import HomePodcasts from './components/HomePodcasts';
import UploadPodcast from './components/UploadPodcast'; // <-- ¡NUEVA IMPORTACIÓN!

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('jwt_token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth-handler" element={<AuthHandler />} />
          {/* Rutas Protegidas */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/home-podcasts" 
            element={
              <PrivateRoute>
                <HomePodcasts />
              </PrivateRoute>
            } 
          />
          <Route // <-- ¡NUEVA RUTA PROTEGIDA!
            path="/upload-podcast" 
            element={
              <PrivateRoute>
                <UploadPodcast />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;