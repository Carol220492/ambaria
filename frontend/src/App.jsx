// frontend/src/App.js

import React, { useEffect } from 'react'; // Asegúrate de que React y useEffect estén importados
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import ReactGA4 from 'react-ga4'; // Importado como ReactGA4 para claridad y evitar conflictos

// Importa todos tus componentes. ¡Asegúrate de que estas rutas son correctas!
import Home from './components/Home.jsx';
import Profile from './components/Profile.jsx';
import AuthHandler from './components/AuthHandler.jsx';
import HomePodcasts from './components/HomePodcasts.jsx';
import UploadPodcast from './components/UploadPodcast.jsx';
import NavBar from './components/NavBar.jsx';
import PodcastDetail from './components/PodcastDetail.jsx'; // Correcto: PodcastDetail.jsx
import ContactForm from './components/ContactForm.jsx';
import GlobalAudioPlayer from './components/GlobalAudioPlayer.jsx';
import EditPodcast from './components/EditPodcast.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import VideoBackground from './components/VideoBackground.jsx';

// --- ID de Medición de Google Analytics ---
// REEMPLAZA 'YOUR_GA4_MEASUREMENT_ID' CON TU ID REAL DE GOOGLE ANALYTICS (G-XXXXXXXXXX)
// RECOMENDACIÓN: Guarda este ID en un archivo .env.development en la raíz de 'frontend/'
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'YOUR_GA4_MEASUREMENT_ID'; 


// Componente para el seguimiento de páginas vistas en Google Analytics
const GALogger = () => {
  const location = useLocation(); // Hook de React Router DOM para acceder a la ubicación actual

  useEffect(() => {
    // Solo envía el evento si ReactGA4 está inicializado y tiene el método sendEvent
    // Esto es CRUCIAL para evitar el error "is not a function"
    if (ReactGA4.isInitialized && typeof ReactGA4.sendEvent === 'function') {
      ReactGA4.sendEvent('page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title, 
      });
      console.log(`GA4: Evento 'page_view' enviado para: ${location.pathname}`);
    } else {
      console.warn('GA4: ReactGA4 no está completamente inicializado o sendEvent no es una función. No se envió el evento page_view.');
    }
  }, [location]); // Este efecto se ejecuta cada vez que el objeto 'location' cambia (navegación)

  return null; // Este componente no renderiza nada visualmente
};


// Componente de Ruta Privada para proteger rutas que requieren autenticación
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('jwt_token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Componente principal de la aplicación
function App() {
  // Mover la inicialización de ReactGA4 dentro de un useEffect
  // para asegurar que el entorno de React esté completamente listo
  useEffect(() => {
    if (GA4_MEASUREMENT_ID && GA4_MEASUREMENT_ID !== 'YOUR_GA4_MEASUREMENT_ID') {
      ReactGA4.initialize(GA4_MEASUREMENT_ID);
      console.log('GA4: Inicializado con ID:', GA4_MEASUREMENT_ID);
    } else {
      console.warn('GA4: ID de Medición no configurado o es el placeholder. El seguimiento de Analytics no funcionará.');
    }
  }, []); // El array vacío asegura que solo se ejecute una vez al montar el componente

  return (
    <Router> {/* BrowserRouter envuelve toda la aplicación para manejar las rutas */}
      <AuthProvider> {/* Provee el contexto de autenticación a toda la app */}
        
        <VideoBackground /> {/* Componente de video de fondo fijo */}
        
        {/* GALogger DEBE estar dentro de Router para usar useLocation */}
        <GALogger /> 

        {/* CONTENEDOR PRINCIPAL DE LA APLICACIÓN */}
        {/* Asegura que el contenido esté por encima del video de fondo con zIndex */}
        {/* Añadido paddingTop para compensar la altura del NavBar fijo (ajusta '80px' si tu NavBar es más alto/bajo) */}
        <div className="App" style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}>
          
          {/* NavBar GLOBAL - Renderizado UNA SOLA VEZ aquí. */}
          <NavBar /> 

          {/* Definición de todas las rutas de la aplicación */}
          <Routes>
            {/* Rutas Públicas (Home/Login y AuthHandler) - No requieren autenticación */}
            <Route path="/" element={<Home />} />
            <Route path="/auth-callback" element={<AuthHandler />} />

            {/* Rutas con NavBar global (ContactForm y ContactSuccess) - Accesibles públicamente */}
            <Route path="/contact" element={<ContactForm />} />
            <Route
              path="/contact-success"
              element={
                <div style={{ color: 'white', textAlign: 'center', marginTop: '100px', padding: '20px' }}>
                  <h2 style={{ color: '#8AFFD2' }}>¡Gracias por tu mensaje!</h2>
                  <p>Hemos recibido tu consulta y nos pondremos en contacto contigo pronto.</p>
                  <Link to="/home-podcasts" style={{ color: '#00FFFF', textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>Volver a la lista de podcasts</Link>
                </div>
              }
            />

            {/* Rutas Protegidas - Requieren autenticación a través de PrivateRoute */}
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
            <Route
              path="/upload-podcast"
              element={
                <PrivateRoute>
                  <UploadPodcast />
                </PrivateRoute>
              }
            />
            <Route
              path="/podcast/:id"
              element={
                <PrivateRoute>
                  <PodcastDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-podcast/:id"
              element={
                <PrivateRoute>
                  <EditPodcast />
                </PrivateRoute>
              }
            />
          </Routes>

          <GlobalAudioPlayer /> {/* Reproductor de audio global, al final del contenido */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;