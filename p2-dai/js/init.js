let cuestionarioCount = 1;

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

//Agregar la cruz de borrado a todos los bloques cuando la pagina se carga
document.addEventListener('DOMContentLoaded',function() {
    var bloques = document.querySelectorAll('.bloque');
    bloques.forEach(function(bloque) {
        addCruz(bloque);
    })
});

//Llamar a addFormPregunta cuando la pagina se carga
document.addEventListener('DOMContentLoaded', (event)=>{
    const sections = document.querySelectorAll('section');

    sections.forEach(section =>{
        const encabezado = section.querySelector('h2');
        encabezado.insertAdjacentElement('afterend',addFormPregunta(section));
    })
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

            if(event.target.closest('#nuevoCuestionario')){
                addCuestionario(event);
            }
            else{
                addPregunta(event);
            }
        }
    }

    //Agregar a todos los inputs despues de cargado la pagina
    window.addEventListener('load', function(){
        const inputs = this.document.querySelectorAll('input[type="text"], input[type="url"]');
        //Agregamos el evento a todos los inputs de tipo texto y url
        inputs.forEach(input => input.addEventListener('keypress',handleEnterPress));
    })
})

function borrarPregunta(bloqueNode){

    var pregunta = bloqueNode.closest('.bloque');

    if(pregunta){
        //Si es la ultima pregunta del cuestionario se elimina el cuestionario
        if(pregunta.parentElement.querySelectorAll('.bloque').length === 1){
            //Eliminar el cuestionario del DOM
            var cuestionario = pregunta.parentElement;
            if (cuestionario){
                cuestionario.remove();
            }

            //Elimar la entrada en el indide al principio de la pagina
            var indice = document.querySelector('nav > ul > li > a[href="#' + cuestionario.id + '"]').closest('li');
            if(indice){
                indice.remove();
            }
        }
        else{
            //Eliminar el bloque del DOM
            pregunta.remove();
        }
    }
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

//Funcion para agregar pregunta
function addPregunta(event){

    const divNode = event.target.closest('.formulario');
    const pregunta = divNode.querySelector('input[type="text"]').value;
    const trueOfalses = divNode.querySelector('input[name$="_respuesta"]:checked');
    const sectionInsert = divNode.closest('section');

    //Validar que la pregunta no este vacia
    if(pregunta){
        
        //Validar que la respuesta no este vacia
        if(trueOfalses === null){
            window.alert("El enunciado debe tener una respuesta: Verdadero o Falso");
        }else{
            //Insertar la pregunta en el cuestionario
            sectionInsert.appendChild(componedorPregunta(pregunta,trueOfalses.value));
            //Limpiar los campos del formulario
            divNode.querySelector('input[type="text"]').value = '';
            const radios = divNode.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                if(radio.value == "verdadero"){
                    radio.checked = true;
                }
                else{
                    radio.checked = false;
                }
            });
            console.log("Pregunta agregada correctamente");
        }
    }else{
        window.alert("El enunciado de la pregunta no puede estar vacio");
    }

}
//Funcion para componer la pregunta
function componedorPregunta(pregunta,respuesta){

    const div = document.createElement('div');
    div.className = 'bloque';

    const preguntaA = document.createElement('div');
    preguntaA.className = 'pregunta';
    preguntaA.textContent = pregunta;

    const respuestaDiv = document.createElement('div');
    respuestaDiv.className = "respuesta";
    respuestaDiv.setAttribute('data-valor',respuesta == 'verdadero' ? 'true' : 'false');

    div.appendChild(preguntaA);
    div.appendChild(respuestaDiv);

    addCruz(div);

    return div;

}
//Funcion para agregar cuestionario
function addCuestionario(event){
    const divNode = event.target.closest('.formulario');
    const ciudad = divNode.querySelector('input[id="tema"]').value;
    const url = divNode.querySelector('input[id="imagen"]').value;
    const mainInsection = event.target.closest('main');


    if(ciudad){
        
         const ciudadA = ciudad.charAt(0).toUpperCase() + ciudad.slice(1).toLowerCase();
        if(url){
                mainInsection.appendChild(componerCuestionario(ciudadA,url));
                divNode.querySelector('input[type="text"]').value = '';
                divNode.querySelector('input[type="url"]').value = '';
                console.log("Cuestionario agregado con exito");
        }else{
            window.alert("Para crear el cuestionario necesitas una image");
        }
    }else{
        window.alert("Para crear el cuestionario tienes que poner una ciudad");
    }

}

//Funcion para componer el cuestionario
function componerCuestionario(ciudad,url){

    const section = document.createElement('section');
    section.id = "c" + cuestionarioCount;
    const h2 = document.createElement('h2');
    const img = document.createElement('img');
    img.src = url;
    img.alt = ciudad;
    const nombreCuestionario = "Cuestionario sobre " + ciudad;
    h2.appendChild(img);
    h2.appendChild(document.createTextNode(nombreCuestionario));
    section.appendChild(h2);

    section.appendChild(addFormPregunta(section));

    //agregar el cuestionario al indice
    const index = document.querySelector('nav > ul');
    index.innerHTML += `<li><a href="#${section.id}">${ciudad}</a></li>`;
   

    cuestionarioCount++;

    return section;
}