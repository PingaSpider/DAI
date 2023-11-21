let cuestionarioCount = 1;  // Variable global para contar los cuestionarios

function addCuestionario(event) {
    event.preventDefault(); // Prevener el comportamiento por defecto del formulario

    // Acceder a los datos del formulario
    const form = event.target.closest(".formulario");
    const titulo = form.querySelector("[name='tema']").value;


    // Comprobar que los campos no estén vacíos
    if (!titulo) {
        alert("Todos los campos son obligatorios.");
        return; 
    }

    // Llama a la función para agregar el cuestionario
    agregarCuestionario(titulo);

    // Limpiar los campos del formulario
    form.querySelector("[name='tema']").value = "";
}

// Función para agregar un cuestionario
function agregarCuestionario(titulo) {
    const id = titulo.toLowerCase().replace(/\s+/g, '_');
    const nuevoCuestionario = document.createElement('section');
    nuevoCuestionario.id = id;

    // Crear el nodo de la imagen
    const imagenNode = document.createElement('img');
    imagenNode.alt = `Imagen de ${titulo}`;
    imagenNode.src = 'https://chat.openai.com/c/b268e16a-b0bb-4247-adca-8bf2d51ede8a'; // Puedes poner una imagen temporal aquí

    // Crear y configurar el componente 'encabezado-cuestionario'
    const encabezadoCuestionario = document.createElement('encabezado-cuestionario');
    encabezadoCuestionario.setAttribute('data-tema', titulo);
    nuevoCuestionario.appendChild(encabezadoCuestionario);


    // Añadir el nuevo cuestionario al final del section
    const footer = document.querySelector('footer');
    document.body.insertBefore(nuevoCuestionario, footer);

    // Agregar el formulario de creación de preguntas despues del encabezado del cuestionario
    const formulario = addFormPregunta(nuevoCuestionario);
    //Colocar el formulario justo después del encabezado del cuestionario
    encabezadoCuestionario.insertAdjacentElement('afterend', formulario);



    // Obtiene el valor del tema
    let tema = document.querySelector('input[name="tema"]').value;

    // Obtiene la etiqueta <nav>
    let index = document.querySelector('nav').querySelector('ul');

    // Agrega el nuevo <li> al final de la etiqueta <nav> y <li><a href="#londres">Londres</a></li>
    index.innerHTML += `<li><a href="#${tema.toLowerCase()}">${tema}</a></li>`;
    

    //Añade un listener al nuevo cuestionario para los inputs que se creen en el futuro y llame a la funcion addPregunta si damos enter en el input de texto
    nuevoCuestionario.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addPregunta(event);
        }
    });

}






