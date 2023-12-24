const base= '/cuestionario/v1';

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
  var cuestionarioId = bloque.closest('section').dataset.cuestionarioId;
  var preguntaId = bloque.dataset.preguntaId;
  const url = `${base}/cuestionario/${cuestionarioId}/preguntas/${preguntaId}`;
  // Verificar si se encontró un bloque
  if (bloque) {
    fetch(url, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    })
    .then(response => {
      if (response.ok) {
        // Verificar si después de eliminar este bloque, no quedan más preguntas en el cuestionario
        if (bloque.parentElement.querySelectorAll('.bloque').length === 1) {
          // Si es el último bloque, eliminar el cuestionario del DOM también usando el ancestro con selector section
          var cuestionario = bloque.closest('section');
          if (cuestionario) {
              borrarCuestionario(cuestionarioId);
              cuestionario.remove();
          }
        }
        // Ahora eliminamos el bloque del DOM
        bloque.remove();
      } else {
        throw new Error('Error al eliminar la pregunta');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
}

function borrarCuestionario(cuestionarioId){
  const url = `${base}/cuestionario/${cuestionarioId}`;
  
  fetch(url, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })
  .then(response => {
    if (response.ok) {

      // Eliminar la entrada en el índice al principio de la página
      var indice = document.querySelector('nav > ul > li > a[href="#' + cuestionarioId + '"]').closest('li');
      if (indice) {
          indice.remove();
      }
    } else {
      throw new Error('Error al eliminar el cuestionario');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
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
    // Agregar el formulario a cada sección de la página al cargar despues del  encabezado
    sections.forEach(section => {
        const formulario = addFormPregunta(section);
        const encabezado = section.querySelector('encabezado-cuestionario');
        encabezado.insertAdjacentElement('afterend', formulario);
    });
    
    

});

function initPreguntas(cuestionarioId) {
  const request =  {method: 'GET',
                    headers: { 
                              'Content-Type': 'application/json',
                              'Accept': 'application/json',
                    }};
  fetch(`${base}/${cuestionarioId}/preguntas`,request)
    .then(response => {
      if (response.status === 204) {
  
        return; // No hay preguntas, pero no es un error
      }
      if (!response.ok) {
        throw new Error('Problema al obtener preguntas');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.result) {
        data.result.forEach(pregunta => {
          if (pregunta && pregunta.preguntaId && pregunta.pregunta && typeof pregunta.respuesta !== 'undefined') {
            agregaPregunta(cuestionarioId, pregunta.preguntaId, pregunta.pregunta, pregunta.respuesta);
          } else {
            console.error('Una de las preguntas recibidas no tiene el formato esperado:', pregunta);
          }
        });
      }
    })
    .catch(error => {
      console.error('Error al inicializar preguntas:', error);
    });
}

function initCuestionarios() {
  const request =  {method: 'GET',
                    headers: { 
                              'Content-Type': 'application/json',
                              'Accept': 'application/json',
                    }};

  fetch(`${base}/cuestionario`,request)
    .then(response => {
      // Si la respuesta es 204 No Content, simplemente inicializa la página sin cuestionarios.
      if (response.status === 204) {
        // Aquí puedes realizar cualquier inicialización que sea necesaria cuando no hay cuestionarios.
        return;
      }
      
      if (!response.ok) {
        throw new Error('Problema al obtener cuestionarios');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.result) {
        data.result.forEach(cuestionario => {
          agregarCuestionario(cuestionario.tema, cuestionario.cuestionarioId);
          
        });
        // Inicializar preguntas para cada cuestionario
        document.querySelectorAll('section[data-cuestionario-id]').forEach((section) => {
          let cuestionarioId = section.dataset.cuestionarioId;
          initPreguntas(cuestionarioId);
        });
      }
    })
    .catch(error => {
      console.error('Error al inicializar cuestionarios:', error);
    });
}

document.addEventListener('DOMContentLoaded', initCuestionarios);




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

