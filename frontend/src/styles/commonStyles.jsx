// frontend/src/styles/commonStyles.jsx

// Estilo para el contenedor principal de la página (AHORA SÓLO PARA COLORES/FONTES/COSAS NO DE LAYOUT)
// Las propiedades de layout (ancho, alto mínimo, centrado, padding superior) serán manejadas
// por la clase 'main-content-wrapper' en index.css.
export const pageContainerStyle = {
  backgroundColor: 'transparent', // Crucial para ver el VideoBackground
  color: 'white',
  fontFamily: 'Arial, sans-serif',
  // minHeight, padding, paddingTop, display, flexDirection, alignItems
  // ¡ESTAS PROPIEDADES FUERON ELIMINADAS O SIMPLIFICADAS PORQUE ENTRAN EN CONFLICTO CON main-content-wrapper!
  // El paddingTop se gestionará en App.jsx para compensar el navbar fijo.
  // El minHeight será del body y del main-content-wrapper.
  // El centrado y display/flexDirection será del main-content-wrapper.
};

// Estilo para la caja de contenido central (la tarjeta que contiene el formulario/listado)
// Las propiedades de layout (maxWidth, margin, width) serán manejadas por la clase o por el componente padre.
// Aquí solo mantenemos las propiedades visuales de la "caja".
export const contentBoxStyle = {
  // maxWidth: '800px', // ¡ELIMINADO! Esto lo manejará el CSS global o el componente específico.
  // margin: '20px auto', // ¡ELIMINADO! Esto lo manejará el CSS global.
  padding: '30px',
  backgroundColor: 'rgba(42, 42, 74, 0.7)', // Fondo semi-transparente
  borderRadius: '10px',
  boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
  // width: '100%', // ¡ELIMINADO! Esto lo manejará el CSS global o el componente específico.
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