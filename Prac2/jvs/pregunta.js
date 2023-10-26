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

}


function addPregunta(event) {
    // Obtener el formulario desde el botón presionado
    const formDiv = event.target.closest('.formulario');

    // Obtener los valores de los campos del formulario
    const enunciado = formDiv.querySelector('input[name$="_pregunta"]').value;
    const respuesta = formDiv.querySelector('input[name$="_respuesta"]:checked').value;

    // Crear un nuevo bloque de pregunta y respuesta
    const bloqueDiv = document.createElement('div');
    bloqueDiv.classList.add('bloque');

    const preguntaDiv = document.createElement('div');
    preguntaDiv.classList.add('pregunta');
    preguntaDiv.textContent = enunciado;
    bloqueDiv.appendChild(preguntaDiv);

    const respuestaDiv = document.createElement('div');
    respuestaDiv.classList.add('respuesta');
    respuestaDiv.setAttribute('data-valor', respuesta === 'verdadero' ? "true" : "false");
    bloqueDiv.appendChild(respuestaDiv);

    // Insertar el bloque al final de la lista de preguntas dentro del <section>
    const sectionNode = formDiv.closest('section');
    sectionNode.appendChild(bloqueDiv);

    // Opcional: Limpiar el formulario
    formDiv.querySelector('input[name$="_pregunta"]').value = '';
    formDiv.querySelector('input[name$="_respuesta"]:checked').checked = false;
    formDiv.querySelector('input[name$="_respuesta"][value="verdadero"]').checked = true;  // Resetear a "verdadero" como valor por defecto

    addCruz(bloqueDiv);
}

