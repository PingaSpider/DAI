


function addFormPregunta(sectionNode) {
    // Crear el formulario dinámicamente
    const formularioDiv = document.createElement('div');
    formularioDiv.classList.add('formulario');
    
    const ul = document.createElement('ul');

    // Enunciado de la pregunta
    const liPregunta = document.createElement('li');
    const labelPregunta = document.createElement('label');
    labelPregunta.textContent = "Enunciado de la pregunta:";
    const inputPregunta = document.createElement('input');
    inputPregunta.type = "text";
    inputPregunta.name = sectionNode.id + "_pregunta";

    liPregunta.appendChild(labelPregunta);
    liPregunta.appendChild(inputPregunta);
    ul.appendChild(liPregunta);

    // Respuesta
    const liRespuesta = document.createElement('li');
    const labelRespuesta = document.createElement('label');
    labelRespuesta.textContent = "Respuesta:";
    
    const inputRadioV = document.createElement('input');
    inputRadioV.type = "radio";
    inputRadioV.name = sectionNode.id + "_respuesta";
    inputRadioV.value = "verdadero";
    inputRadioV.id = sectionNode.id + "_v";
    inputRadioV.checked = true;
    
    const labelRadioV = document.createElement('label');
    labelRadioV.textContent = "Verdadero";
    labelRadioV.setAttribute('for', inputRadioV.id);
    labelRadioV.classList.add('radio');
    
    const inputRadioF = document.createElement('input');
    inputRadioF.type = "radio";
    inputRadioF.name = sectionNode.id + "_respuesta";
    inputRadioF.value = "falso";
    inputRadioF.id = sectionNode.id + "_f";
    
    const labelRadioF = document.createElement('label');
    labelRadioF.textContent = "Falso";
    labelRadioF.setAttribute('for', inputRadioF.id);
    labelRadioF.classList.add('radio');

    liRespuesta.appendChild(labelRespuesta);
    liRespuesta.appendChild(inputRadioV);
    liRespuesta.appendChild(labelRadioV);
    liRespuesta.appendChild(inputRadioF);
    liRespuesta.appendChild(labelRadioF);
    ul.appendChild(liRespuesta);

    // Botón
    const liButton = document.createElement('li');
    const button = document.createElement('input');
    button.type = "button";
    button.name = "añade"
    button.value = "Añadir nueva pregunta";
    button.addEventListener('click', addPregunta);

    liButton.appendChild(button);
    ul.appendChild(liButton);

    formularioDiv.appendChild(ul);
    
    // Insertar el formulario a continuación del título del cuestionario
    const title = sectionNode.querySelector('h1, h2, h3, h4, h5, h6'); // Asume que tienes un título dentro de la sección.
    if (title) {
        title.insertAdjacentElement('afterend', formularioDiv);
    } else {
        sectionNode.prepend(formularioDiv);
    }

    // Agregar la clase al formulario para que se muestre con estilo
    formularioDiv.classList.add('addPregunta');


    // Retorno el formularioDiv que es el nodo del formulario que acabo de crear
    return formularioDiv;

}


function addPregunta(event) {
    event.preventDefault();

    // Obtener el formulario desde el botón presionado
    const formDiv = event.target.closest('.formulario');
    const enunciado = formDiv.querySelector('input[name$="_pregunta"]').value;
    const respuesta = formDiv.querySelector('input[name$="_respuesta"]:checked').value;
    
    // Asegurarse de que se está obteniendo el ID correcto del cuestionario desde el atributo data del elemento section
    const cuestionarioId = formDiv.closest('section').dataset.cuestionarioId;

    // Datos de la pregunta para enviar al servidor
    const datosPregunta = {
        cuestionarioId: cuestionarioId,
        pregunta: enunciado,
        respuesta: respuesta === 'verdadero' ? true : false
    };

    // Enviar solicitud al servidor
    const url = `${base}/cuestionario/${cuestionarioId}/preguntas`;
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosPregunta),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 409) {
            // Error 409 - Conflicto: la pregunta ya existe
            return response.json().then(data => {
                alert(data.error); // Muestra una alerta con el mensaje de error
                return null; // Devuelve null para indicar que no hay más procesamiento
            });
        } else {
            // Otros errores que no sean 409
            return response.json().then(data => {
                throw new Error(data.error || 'Error desconocido');
            });
        }
    })
    .then(data => {
        if (data && data.result) {
            // Asumiendo que el servidor devuelve el ID de la pregunta
            const idPregunta = data.result.id;
            agregaPregunta(cuestionarioId, idPregunta, enunciado, respuesta);
            // Limpia el formulario...
            // Limpia el formulario aquí
            const form = formDiv.querySelector('ul');
            form.querySelector('input[name$="_pregunta"]').value = ''; // Limpiar el campo de texto de la pregunta
            form.querySelectorAll('input[name$="_respuesta"]').forEach(radio => {
                radio.checked = false; // Deseleccionar todos los radios
            });
            form.querySelector('input[name$="_respuesta"][value="verdadero"]').checked = true; // Seleccionar por defecto "Verdadero" si es necesario
        }
    })
    .catch(error => {
        // El error 409 ya se manejó, así que cualquier error aquí es inesperado
        console.error('Error inesperado al agregar pregunta:', error);
    });
}


function agregaPregunta(cuestionarioId, idPregunta, enunciado, respuesta) {
    // Encuentra el section correspondiente al cuestionarioId
    const cuestionarioSection = document.querySelector(`section[data-cuestionario-id='${cuestionarioId}']`);
    if (!cuestionarioSection) {
        console.error('No se encontró el cuestionario correspondiente al ID:', cuestionarioId);
        return;
    }

    // Asegúrate de que todos los parámetros estén definidos antes de continuar
    if (typeof cuestionarioId === 'undefined' || typeof idPregunta === 'undefined' ||
    typeof enunciado === 'undefined' || typeof respuesta === 'undefined') {
        console.error('agregaPregunta fue llamada con parámetros indefinidos.');
        return;
    }   

    // Crear un nuevo bloque de pregunta y respuesta
    const bloqueDiv = document.createElement('div');
    bloqueDiv.classList.add('bloque');
    bloqueDiv.setAttribute('data-pregunta-id', idPregunta); // Establecer el ID de la pregunta en el elemento

    const preguntaDiv = document.createElement('div');
    preguntaDiv.classList.add('pregunta');
    preguntaDiv.textContent = enunciado;
    bloqueDiv.appendChild(preguntaDiv);

    const respuestaDiv = document.createElement('div');
    respuestaDiv.classList.add('respuesta');
    respuestaDiv.textContent = `Respuesta: ${respuesta ? 'Verdadero' : 'Falso'}`;
    bloqueDiv.appendChild(respuestaDiv);

    // Insertar el bloque al final del cuestionario section
    cuestionarioSection.appendChild(bloqueDiv);

    // Si tienes una función addCruz() que agrega un botón para eliminar preguntas, puedes llamarla aquí
    addCruz(bloqueDiv);
}



