// frontend/src/styles/commonStyles.jsx

// Estilo para el contenedor principal de la página (SOLO PARA COLORES/FONTES/COSAS NO DE LAYOUT)
// Las propiedades de layout (ancho, alto mínimo, centrado, padding superior) serán manejadas
// por la clase 'main-content-wrapper' en index.css.
export const pageContainerStyle = {
  backgroundColor: 'transparent', // Crucial para ver el VideoBackground
  color: 'white',
  fontFamily: 'Arial, sans-serif',
  // minHeight, padding, paddingTop, display, flexDirection, alignItems: ¡manejados por index.css!
};

// Estilo para la caja de contenido central (la tarjeta que contiene el formulario/listado)
// ¡CAMBIO CLAVE AQUÍ! Hacemos que el ancho sea 100% y el margen automático para que se centre.
// El MAX-WIDTH se moverá al CSS global (index.css) para esta caja en escritorio,
// y en móvil simplemente ocupará el 100% del contenedor padre.
export const contentBoxStyle = {
  width: '100%', // ¡Ocupa el 100% del espacio DISPONIBLE en su padre!
  margin: '20px auto', // Centrar la caja horizontalmente
  padding: '30px', // Padding interno de la caja
  backgroundColor: 'rgba(42, 42, 74, 0.7)', // Fondo semi-transparente
  borderRadius: '10px',
  boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
  boxSizing: 'border-box', // ¡MUY IMPORTANTE! Asegura que el padding no cause desbordamiento
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