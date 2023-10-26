
//Apartado
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

function borraPregunta(bloqueNode) {
  // Eliminar el bloque de preguntas
  bloqueNode.remove();

  // Comprobar si hay más bloques de preguntas
  var bloquesRestantes = document.querySelectorAll('.bloque');
  if (bloquesRestantes.length === 0) {
    // Aquí, podrías eliminar todo el cuestionario del DOM, así como cualquier otro elemento relacionado
    // que deba ser limpiado. Esto dependerá de tu estructura específica del DOM y de tus requisitos.
    var cuestionario = document.querySelector('.cuestionario'); // O el selector que corresponda a tu contenedor de cuestionario
    if (cuestionario) {
      cuestionario.remove();
      // Aquí también podrías eliminar la entrada del índice relacionada, si existe.
    }
  }
}




// Cuando el contenido esté cargado, aplicar la función addCruz a todos los bloques
document.addEventListener('DOMContentLoaded', function () {
  var bloques = document.querySelectorAll('.bloque');
  bloques.forEach(function(bloque) {
    addCruz(bloque);
  });
});
