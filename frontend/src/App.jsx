// frontend/src/App.js

import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Home from './components/Home.jsx'; // Esto es tu LoginPage
import Profile from './components/Profile.jsx';
import AuthHandler from './components/AuthHandler.jsx';
import HomePodcasts from './components/HomePodcasts.jsx';
import UploadPodcast from './components/UploadPodcast.jsx';
import NavBar from './components/NavBar.jsx'; // <-- Importa NavBar aquí
import PodcastDetail from './components/PodcastDetail.jsx';
import ContactForm from './components/ContactForm.jsx';
import GlobalAudioPlayer from './components/GlobalAudioPlayer.jsx';
import EditPodcast from './components/EditPodcast.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import VideoBackground from './components/VideoBackground.jsx';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('jwt_token');
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider> {/* <-- AuthProvider envuelve todo */}
        <VideoBackground />

        {/* CONTENEDOR PRINCIPAL - Asegura que el contenido esté por encima del video */}
        {/* Añadido paddingTop para compensar la altura del NavBar fijo (ajusta '80px' si tu NavBar es más alto/bajo) */}
        <div className="App" style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}>
          
          {/*
            NAVBAR GLOBAL - Renderizado UNA SOLA VEZ aquí.
            Se mostrará en TODAS las rutas (HomePodcasts, UploadPodcast, PodcastDetail, EditPodcast, Profile, Contact).
            Home (la página de login) y AuthHandler NO tendrán este Navbar.
          */}
          <NavBar /> {/* <--- ¡MOVIDO Y POSICIONADO AQUÍ, UNA SOLA VEZ! */}

          <Routes>
            {/* Rutas Públicas SIN NavBar (Home/Login y AuthHandler) */}
            <Route path="/" element={<Home />} />
            <Route path="/auth-callback" element={<AuthHandler />} />

            {/* Rutas con NavBar global (ContactForm y ContactSuccess) */}
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

            {/* Rutas Protegidas - IMPORTANTÍSIMO: NO deben contener <NavBar /> internamente */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  {/* ELIMINADO: <NavBar /> */}
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/home-podcasts"
              element={
                <PrivateRoute>
                  {/* ELIMINADO: <NavBar /> */}
                  <HomePodcasts />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload-podcast"
              element={
                <PrivateRoute>
                  {/* ELIMINADO: <NavBar /> */}
                  <UploadPodcast />
                </PrivateRoute>
              }
            />
            <Route
              path="/podcast/:id"
              element={
                <PrivateRoute>
                  {/* ELIMINADO: <NavBar /> */}
                  <PodcastDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-podcast/:id"
              element={
                <PrivateRoute>
                  {/* ELIMINADO: <NavBar /> */}
                  <EditPodcast />
                </PrivateRoute>
              }
            />
          </Routes>

          <GlobalAudioPlayer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;