
// Función para agregar el icono de eliminar a un bloque
function addCruz(bloqueNode) {
    // Crear el nuevo nodo con el ícono
    var cruz = document.createElement('div');
    cruz.className = 'borra';
    cruz.innerHTML = '&#x2612;'; // Código Unicode para ☒
    cruz.style.cursor = 'pointer'; // Hacer que el cursor cambie a un puntero al pasar sobre la cruz

    // Añadir el evento de clic al ícono
    cruz.addEventListener('click', function(e) {
      borraPregunta(bloqueNode);
    });  
    // Añadir este nodo al principio del bloque (como primer hijo)
    bloqueNode.insertBefore(cruz, bloqueNode.firstChild);
}


// Función para eliminar una pregunta y su cuestionario si es necesario
function borraPregunta(bloqueNode) {
    // Obtener el ancestro con selector .bloque
    var bloque = bloqueNode.closest('.bloque');

    // Verificar si se encontró un bloque
    if (bloque) {
      // Eliminar el bloque del DOM
      bloque.remove();

      // Verificar si no hay más preguntas en el cuestionario
      var preguntas = document.querySelectorAll('.bloque');
      if (preguntas.length === 0) {
        // Si no hay preguntas, eliminar el cuestionario del DOM
        var cuestionario = document.querySelector('.cuestionario');
        cuestionario.remove();

        // Eliminar la entrada en el índice al principio de la página
        var indice = document.querySelector('.indice');
        indice.remove();
      }
    }

}

//Agregar la cruz de borrado a todos los bloques cuando la página se carga
document.addEventListener('DOMContentLoaded', function() {
  
    // Obtener todos los elementos con clase .bloque y agregar la cruz de borrado a cada uno
    var bloques = document.querySelectorAll('.bloque');
    bloques.forEach(function(bloque) {
      addCruz(bloque);
    });
});

// Llamar a addFormPregunta cuando la página se carga
window.addEventListener('DOMContentLoaded', (event) => {
    const sections = document.querySelectorAll('section');
    sections.forEach(sectionNode => addFormPregunta(sectionNode));
});

// Llamar a addCuestionario cuando se presiona el botón "Crear cuestionario"
document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.querySelector('input[name="crea"]');
    button.addEventListener('click',addCuestionario);
});

document.addEventListener("DOMContentLoaded", function() {
  // Función que se ejecutará cuando se presione 'Enter' en un input
  function handleEnterPress(event) {
      if (event.key === 'Enter') {
          //event.preventDefault();

          // Si el input está dentro del div con id 'nuevoCuestionario'
          if (event.target.closest('#nuevoCuestionario')) {
              addCuestionario(event);
          }
          else{
              addPregunta(event);
          }
      }
  }
  // Agregamos el evento a todos los inputs de tipo texto después de que se cargue toda la página, incluyendo recursos y recargas
  window.addEventListener('load', function() {
    // Seleccionamos todos los inputs de tipo texto y url y agregamos el evento
    const inputs = document.querySelectorAll('input[type="text"], input[type="url"]');
    inputs.forEach(input => input.addEventListener('keypress', handleEnterPress));
  });
  
});
