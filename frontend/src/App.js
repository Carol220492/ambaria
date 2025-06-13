import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import AuthHandler from './components/AuthHandler';
import HomePodcasts from './components/HomePodcasts';
import UploadPodcast from './components/UploadPodcast';
import NavBar from './components/NavBar';
import PodcastDetail from './components/PodcastDetail'; // <-- ¡NUEVA IMPORTACIÓN!

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
          {/* ¡NUEVA RUTA PARA LOS DETALLES DEL PODCAST! ESTO ES LO QUE ESTABA MAL */}
          <Route
            path="/podcast/:id" // <-- DEBE ESTAR ASÍ (path y element como atributos directos)
            element={
              <PrivateRoute>
                <NavBar />
                <PodcastDetail />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;