const base= '/cuestionario/v1';

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::EVENTLISTENER:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//Llama a la funcion initCuestionarios cuando la pagina se carga
document.addEventListener('DOMContentLoaded',initCuestionarios);

//Agregar la cruz de borrado a todos los bloques cuando la pagina se carga
document.addEventListener('DOMContentLoaded',function() {
   var bloques = document.querySelectorAll('.bloque');
   bloques.forEach(function(bloque) {
       addCruz(bloque);
   })
});

//Vaciar todos los inputs de tipo texto cuando se recarga la pagina
document.addEventListener('DOMContentLoaded',function(){
    var inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(function(input){
        input.value = '';
    });
});


//Llamar a addCuestionario si el boton de añadir cuestionario es clickeado o se presiona enter
document.addEventListener('DOMContentLoaded',(event)=>{
    const buttonCuestionario = document.querySelector("input[name='crea']");
    buttonCuestionario.addEventListener('click',addCuestionario);
});

//Llamar a addPregunta si el boton de añadir pregunta es clickeado o se presiona enter
document.addEventListener('DOMContentLoaded', function(){

    //Funcion para manejar el evento de presionar enter
    function handleEnterPress(event){
        if(event.key === 'Enter'){
            //Si el id es nuevoCuestion
            if(event.target.closest('#nuevoCuestionario')){
                addCuestionario(event);        
            }
            else{
                addPregunta(event);
            }
        }

        //Agregar a todos los inpust de tipo button despues de cargado la pagina
        const buttons = document.querySelectorAll('input[type="button"]');
        buttons.forEach(button => button.addEventListener('keypress',handleEnterPress));

    }

    //Agregar a todos los inputs despues de cargado la pagina
    window.addEventListener('load', function(){
        //Agregar a todos los inputs de cualquier tipo
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => input.addEventListener('keypress',handleEnterPress));
    })
})

//Actualizar el estado del acordeon cuando se cliquea en el acordeon
document.addEventListener('click', function(event) {
    if (event.target.tagName.toLowerCase() === 'summary') {
        const acordeon = event.target.closest('details');
        const pregunta = acordeon.querySelector('.bloque');
        const cuestionarioId = event.target.closest('section').id;
        const preguntaId = pregunta.dataset.preguntaId;
        const acordeonEstado = acordeon.hasAttribute('open') ? "false" : "true";
        
        //Actualizar el estado del acordeon en el servidor
        actualizarEstado(cuestionarioId,preguntaId,acordeonEstado);
    }

});


function addCruz(bloqueNode){

    //create new div
    var cruz = document.createElement("div");
    //Añadimos el nombre de clase
    cruz.className = "borra";
    cruz.innerHTML = "&#x2612;";
    //añadimos el div al bloque como primer hijo
    bloqueNode.insertBefore(cruz, bloqueNode.firstChild);   

    //añadimos el evento de clic al icono
    cruz.addEventListener('click',function(e){
        borrarPregunta(bloqueNode);
    });
}
//Funcion para agregar el formulario de pregunta
function addFormPregunta(sectionNode){


    let textInput = sectionNode.id + "_pregunta";

    const div = document.createElement('div');
    div.className = "formulario";
    
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    
    //Primer Elemento de la lista
    const label = document.createElement('label');
    label.textContent = "Enunciado de la pregunta";
    label.htmlFor = textInput;
    
    const input = document.createElement('input');
    input.type = "text";
    input.name = textInput;
    input.id = textInput;

    //Colocamos el primer elemento de la lista
    li.appendChild(label);
    li.appendChild(input);
    ul.appendChild(li);

    //Añadimos las respuesta a la UL
    ul.appendChild(createTrueOFalse("_respuesta", sectionNode.id));
    ul.appendChild(createButtonNewCuestion());
    
    div.appendChild(ul);

    //Añadir el evento de presionar enter a todos los inputs del formulario de pregunta
    div.addEventListener('keypress', function(event){
        if(event.key === 'Enter'){
            addPregunta(event);
        }
    });
    
    return div
}

function createTrueOFalse(inputName,sectionId){

    const li = document.createElement('li');
    const label = document.createElement('label');
    label.textContent = "Respuesta:";
    li.appendChild(label);

    const opciones = ["verdadero" , "falso"];

    opciones.forEach((opcion, index) => {
        const input = document.createElement('input');
        input.type = "radio";
        input.name = sectionId + inputName;
        input.value = opcion;

        if(input.value == "verdadero"){
            input.checked = true;
        }

        
        const label2 = document.createElement('label');
        label2.textContent = opcion.charAt(0).toUpperCase() + opcion.slice(1);
        label2.htmlFor = sectionId + "_" + opcion.charAt(0);
        label2.className = "radio";
        
        li.appendChild(input);
        li.appendChild(label2);

    });

    return li;

}
//Funcion para crear el boton de añadir nueva pregunta
function createButtonNewCuestion(){
    const input = document.createElement('input');
    input.type = "button";
    input.value = "Añadir nueva pregunta";

    const li = document.createElement('li');

    input.addEventListener('click',function(e){
        addPregunta(e);
    });

    li.appendChild(input);

    return li;
}
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::PREGUNTASSSSSS::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//:::::::::COMUNICACION CON EL SERVIDOR:::::::::::::::::::::::::::::::
function enviarPreguntaAlServidor(cuestionarioId, pregunta, respuesta,acordeonEstado) {
    const url = `${base}/cuestionarios/${cuestionarioId}/preguntas`;
    if(respuesta == "verdadero"){
        respuesta = true;
    }else{
        respuesta = false;
    }
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            pregunta: pregunta,
            respuesta: respuesta,
            cuestionario: cuestionarioId,
            acordeonEstado: acordeonEstado
        })
    };

    fetch(url, request)
        .then(response => {
            if (!response.ok) {
                if(response.status === 409){
                    window.alert("No se permiten dos preguntas iguales en un cuestionario")
                }
            }
            return response.json();
        })
        .then(data => {
            if (data && data.result) {
                componedorPregunta(cuestionarioId, data.result.preguntaID, pregunta, respuesta,acordeonEstado);
                //Limpiar el input después de crear exitosamente
                // Limpiar el input de la pregunta
                const formulario = document.getElementById(cuestionarioId).querySelector('.formulario');
                const input = formulario.querySelector('input[type="text"]');
                if (input) {
                    input.value = '';
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//Funcion para actulizar estado
function actualizarEstado(cuestionarioId,preguntaId,acordeonEstado){
    const url = `${base}/cuestionarios/${cuestionarioId}/preguntas/${preguntaId}`;

    const request = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            pregunta: preguntaId,
            cuestionario: cuestionarioId,
            acordeonEstado: acordeonEstado
        })
    };

    return fetch(url, request)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Acordeón actualizado correctamente:', data);
            return data;
        })
        .catch(error => {
            console.error('Error al actualizar acordeón:', error);
            throw error;
        });
}
function borrarPregunta(bloqueNode){
    const pregunta = bloqueNode.closest('.bloque');
    const cuestionario = bloqueNode.closest('section');
    const cuestionarioId = cuestionario.id;
    const preguntaId = pregunta.dataset.preguntaId;
    const url = `${base}/cuestionarios/${cuestionarioId}/preguntas/${preguntaId}`;
    const details = pregunta.closest('details');

    fetch(url,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })
    .then(response => {
        if(response.ok){
            //Si es la ultima pregunta del cuestionario se elimina el cuestionario
            if(cuestionario.querySelectorAll('.bloque').length === 1){
                //Eliminar el cuestionario del DOM
                if (cuestionario){
                    try{
                        borrarCuestionario(cuestionarioId);
                    }
                    catch(error){
                        //Si hay un error al eliminar el cuestionario se mantienen el cuestionario
                        console.error('Error:', error);
                    }
                }
            }
            //Eliminar el bloque del DOM
            pregunta.remove();
            //Eliminar el acordeon del DOM
            if(details){
                details.remove();
            }
        }
        else{
            throw new Error('Error al eliminar la pregunta');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
//Funcion para inicializar las preguntas
function initPreguntas(cuestionarioId){
    const url = `${base}/cuestionarios/${cuestionarioId}/preguntas`;
    const request = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };
    
    fetch(url,request)
    .then(response => {
        //Si no hay preguntas simplemente inicializa la pagina sin preguntas
        if(response.status === 204){
            return;
        }
        //Si hay un error al obtener las preguntas se lanza una excepcion
        if(!response.ok){
            //Lanzar error enviado por el servidor
            error = response.json();
            throw new Error('Problema al obtener preguntas', error);
        }
        return response.json();
    })
    .then(data => {
        if(data && data.result){
            data.result.forEach(pregunta => {
                if(pregunta.preguntaID && pregunta.pregunta && pregunta.respuesta !== undefined){
                    componedorPregunta(cuestionarioId,pregunta.preguntaID,pregunta.pregunta,pregunta.respuesta,pregunta.acordeonEstado);
                }else{
                    console.error('Una de las preguntas recibidas no tiene el formato esperado:', pregunta);
                }
            });
        }
    })
    .catch(error => {
        //Colocar la respuesta json en la consola
        console.error('Error al inicializar preguntas:', error);
    });
}

//:::::::::::::::PARTE CLIENTE:::::::::::::::::::::::::::::::::::::::
//Funcion para agregar pregunta
function addPregunta(event){

    const divNode = event.target.closest('.formulario');
    const pregunta = divNode.querySelector('input[type="text"]').value;
    const trueOfalses = divNode.querySelector('input[name$="_respuesta"]:checked');
    const sectionInsert = divNode.closest('section');
    const radios = divNode.querySelectorAll('input[type="radio"]');
    const acordeonEstado = "true";

    //Validar que la pregunta no este vacia
    if(pregunta){
        
        //Validar que la respuesta no este vacia
        if(trueOfalses === null){
            window.alert("El enunciado debe tener una respuesta: Verdadero o Falso");
        }else{
            //Enviar la pregunta al servidor
            const cuestionarioId = sectionInsert.id;
            enviarPreguntaAlServidor(cuestionarioId,pregunta,trueOfalses.value,acordeonEstado);
            radios.forEach(radio => {
                if(radio.value == "verdadero"){
                    radio.checked = true;
                }
                else{
                    radio.checked = false;
                }
            });
        }
    }else{
        window.alert("El enunciado de la pregunta no puede estar vacio");
    }

}
//Funcion para componer la pregunta
function componedorPregunta(cuestionarioId,preguntaId,pregunta,respuesta,acordeonEstado){
    
    const details = document.createElement('details');
    details.className = "acordeon";
    details.id = "" + cuestionarioId + preguntaId;

    if(acordeonEstado === "true"){
        details.toggleAttribute('open');
    }

    const summary = document.createElement('summary');
    summary.innerHTML = "Pregunta" + preguntaId;

    const div = document.createElement('div');
    div.className = 'bloque';


    const preguntaA = document.createElement('div');
    preguntaA.className = 'pregunta';
    preguntaA.textContent = pregunta;

    const respuestaDiv = document.createElement('div');
    respuestaDiv.className = "respuesta";

    if(respuesta){
        respuesta = "Verdadero";
    }else{
        respuesta = "Falso";
    }
    respuestaDiv.textContent = respuesta;

    div.dataset.preguntaId = preguntaId;

    details.appendChild(summary);
    details.appendChild(div);
    div.appendChild(preguntaA);
    div.appendChild(respuestaDiv);

    //Añadir como ultimo hijo del cuestionario
    const section = document.getElementById(cuestionarioId);
    section.appendChild(details);

    addCruz(div);

    return div;
}



//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::PARTE DEL CUESTIONARIO:::::::::::::::::::::::::::::::::::::::::::::::::::::
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//Funcion para agregar cuestionario
function addCuestionario(event){

    event.preventDefault(); // Prevener el comportamiento por defecto del formulario

    const divNode = event.target.closest('.formulario');
    const ciudad = divNode.querySelector('input[id="tema"]').value;


    if(ciudad){
        //Toda la palabra en minuscula
        const ciudadB = ciudad.toLowerCase();
        const ciudadA = ciudadB.split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' '); //Poner la primera letra de cada palabra en mayuscula
        enviarCuestionarioAlServidor(ciudadA);

    }else{
        window.alert("Para crear el cuestionario tienes que poner una ciudad");
    }

}

//Funcion para componer el cuestionario
function componerCuestionario(ciudad,cuestionarioId){

    const section = document.createElement('section');
    section.id = cuestionarioId;

    const img = document.createElement('img');
    img.alt = `Imagen de ${ciudad}`;
    img.src = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57723/globe_east_540.jpg';


    const encabezadoCuestionario = document.createElement('encabezado-cuestionario');
    encabezadoCuestionario.setAttribute('data-tema', ciudad);
    section.appendChild(encabezadoCuestionario);

    // Añadir el nuevo cuestionario al final del section
    const footer = document.querySelector('footer');
    document.body.insertBefore(section, footer);

    // Agregar el formulario de creación de preguntas despues del encabezado del cuestionario
    const formulario = addFormPregunta(section);
    //Colocar el formulario justo después del encabezado del cuestionario
    encabezadoCuestionario.insertAdjacentElement('afterend', formulario);


    //agregar el cuestionario al indice
    const index = document.querySelector('nav > ul');
    index.innerHTML += `<li><a href="#${section.id}">${ciudad}</a></li>`;
    const main = document.querySelector('main');
    main.appendChild(section);

    return section;
}

//OK
function initCuestionarios(){
    const url = `${base}/cuestionarios`;
    const request = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            };
    fetch(url,request)
    .then(response => {
        //Si no hay cuestionarios simplemente inicializa la pagina sin cuestionarios
        if(response.status === 204){
            return;
        }
        //Si hay un error al obtener los cuestionarios se lanza una excepcion
        if(!response.ok){
            throw new Error('Problema al obtener cuestionarios');
        }
        return response.json();
    })
    .then(data => {
        if(data && data.result){
            data.result.forEach(cuestionario => {
                componerCuestionario(cuestionario.tema,cuestionario.cuestionarioID);
                initPreguntas(cuestionario.cuestionarioID);
            });
        }
    })   
    .catch(error => {
        console.error('Error al inicializar cuestionarios:', error);
    }
    );
}

//OK
function borrarCuestionario(cuestionarioId){
    const url = `${base}/cuestionarios/${cuestionarioId}`; // Cambiado a plural "cuestionarios"

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })
    .then(response => {
        if(response.ok){
            //Eliminar la entrada en el indice y el cuestionario del DOM
            const indice = document.querySelector(`nav > ul > li > a[href="#${cuestionarioId}"]`).closest('li');
            const cuestionario = document.getElementById(cuestionarioId);
            if(indice && cuestionario){
                indice.remove();
                cuestionario.remove();
                console.log('Cuestionario eliminado correctamente');
            }
        } else {
            return response.json().then(data => {
                throw new Error(data.error || 'Error al eliminar el cuestionario');
            });
        }
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}
//Enviar el cuestionario al servidor
function enviarCuestionarioAlServidor(tema){
    const url = `${base}/cuestionarios`;
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            tema: tema
        })
    };

    fetch(url,request)
    .then(response => {
        if(response.ok){
            return response.json();
        }
        else{
            if(response.status === 409){
                window.alert("El tema " + tema + " ya existe");
            }
            else{
                //Lanzar error
                throw new Error('Error al enviar la solicitud de cuestionario al servidor');
            }
        }
    })
    .then(data => {
        if(data && data.result){
            componerCuestionario(tema,data.result.cuestionarioID);
            // Limpiar el input después de crear exitosamente
            document.querySelector('#tema').value = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
