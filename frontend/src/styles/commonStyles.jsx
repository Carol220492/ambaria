// frontend/src/styles/commonStyles.jsx

// Estilo para el contenedor principal de la página (SOLO PARA COLORES/FONTES/COSAS NO DE LAYOUT)
// Las propiedades de layout (ancho, alto mínimo, centrado, padding superior) serán manejadas
// por la clase 'main-content-wrapper' en index.css.
export const pageContainerStyle = {
  backgroundColor: 'transparent', // Crucial para ver el VideoBackground
  color: 'white',
  fontFamily: 'Arial, sans-serif',
  // minHeight, padding, paddingTop, display, flexDirection, alignItems: manejados por index.css
};

// Estilo para la caja de contenido central (la tarjeta que contiene el formulario/listado)
// ¡AHORA SÍ! Reintroducimos el maxWidth y el margin para que estas cajas sean más pequeñas y centradas.
export const contentBoxStyle = {
  maxWidth: '800px', // <-- ¡IMPORTANTE! Vuelve a limitar el ancho de la caja
  margin: '20px auto', // <-- ¡IMPORTANTE! Vuelve a centrar la caja
  padding: '30px',
  backgroundColor: 'rgba(42, 42, 74, 0.7)', // Fondo semi-transparente
  borderRadius: '10px',
  boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
  width: '100%', // Asegura que ocupe el ancho disponible dentro del max-width (para móvil)
};

// Puedes añadir más estilos comunes aquí si los identificas
// Por ejemplo, para botones, inputs, etc.
export const formInputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: '#3a3a5a',
  color: 'white',
};

export const primaryButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.3s ease',
};

export const secondaryButtonStyle = {
  padding: '8px 15px',
  backgroundColor: '#555',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.9em',
  transition: 'background-color 0.3s ease',
};

export const dangerButtonStyle = {
  padding: '8px 15px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '0.9em',
  transition: 'background-color 0.3s ease',
};