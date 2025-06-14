import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import AuthHandler from './components/AuthHandler';
import HomePodcasts from './components/HomePodcasts';
import UploadPodcast from './components/UploadPodcast';
import NavBar from './components/NavBar';
import PodcastDetail from './components/PodcastDetail';
import ContactForm from './components/ContactForm'; 
import GlobalAudioPlayer from './components/GlobalAudioPlayer'; // <-- ¡NUEVA IMPORTACIÓN!

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
          <Route path="/auth-callback" element={<AuthHandler />} />
          
          {/* Rutas Públicas (como Contacto) */}
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

          {/* Rutas Protegidas */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <NavBar />
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/home-podcasts"
            element={
              <PrivateRoute>
                <NavBar />
                <HomePodcasts />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload-podcast"
            element={
              <PrivateRoute>
                <NavBar />
                <UploadPodcast />
              </PrivateRoute>
            }
          />
          {/* Ruta para los detalles del podcast */}
          <Route
            path="/podcast/:id"
            element={
              <PrivateRoute>
                <NavBar />
                <PodcastDetail />
              </PrivateRoute>
            }
          />
          {/* Si tuvieras una ruta para Editar Podcast, iría aquí, similar a /podcast/:id */}
        </Routes>
        
        {/* ¡EL REPRODUCTOR DE AUDIO GLOBAL VA AQUÍ! */}
        {/* Este componente estará visible en todas las páginas, en la parte inferior */}
        <GlobalAudioPlayer /> {/* <-- ¡Añade esta línea! */}
      </div>
    </Router>
  );
}

export default App;