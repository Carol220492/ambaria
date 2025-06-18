export const pageContainerStyle = {
  backgroundColor: 'transparent', // Crucial para ver el VideoBackground
  minHeight: '100vh',
  color: 'white',
  padding: '20px', // Mantiene el padding general
  paddingTop: '80px', // <--- ¡NUEVA LÍNEA CLAVE! Añade espacio desde la parte superior para la NavBar
  fontFamily: 'Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Centra horizontalmente el contenido principal
};

// Estilo para la caja de contenido central (la tarjeta que contiene el formulario/listado)
// Esta es la que suele tener el fondo rgba y sombra
export const contentBoxStyle = {
  maxWidth: '800px', // O el valor que necesites para cada componente
  margin: '20px auto', // Margen superior/inferior y centrado horizontal
  padding: '30px',
  backgroundColor: 'rgba(42, 42, 74, 0.7)', // Fondo semi-transparente
  borderRadius: '10px',
  boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
  width: '100%', // Asegura que ocupe el ancho disponible dentro del max-width
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