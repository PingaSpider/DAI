let cuestionarioCount = 1;  // Variable global para contar los cuestionarios

function addCuestionario(event) {
    event.preventDefault(); // Prevener el comportamiento por defecto del formulario

    // Acceder a los datos del formulario
    const form = event.target.closest(".formulario");
    const titulo = form.querySelector("[name='tema']").value;
    const imgUrl = form.querySelector("[name='imagen']").value;

    // Comprobar que los campos no estén vacíos
    if (!titulo || !imgUrl) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    // Llama a la función para agregar el cuestionario
    agregarCuestionario(titulo, imgUrl);
    // Incrementar el contador
    cuestionarioCount++;

    // Limpiar los campos del formulario
    form.querySelector("[name='tema']").value = "";
    form.querySelector("[name='imagen']").value = "";
}

// Función para agregar un cuestionario
function agregarCuestionario(titulo, imgUrl) {
    // Crear el nuevo elemento section
    const nuevoCuestionario = document.createElement('section');

    // Establecer el contenido del nuevo cuestionario
    nuevoCuestionario.innerHTML = `
        <section id= tolowercase(${titulo})>
        <h2><img src="${imgUrl}" alt="${titulo}"> Cuestionario sobre ${titulo}</h2>
        <!-- Puedes agregar más bloques de preguntas aquí si lo necesitas -->
    `;

    // Añadir el nuevo cuestionario al final del section
    const footer = document.querySelector('footer');
    document.body.insertBefore(nuevoCuestionario, footer);

    // Agregar el formulario de creación de preguntas
    addFormPregunta(nuevoCuestionario);

    // Obtiene el valor del tema
    let tema = document.querySelector('input[name="tema"]').value;

    // Crear un nuevo elemento <ul> para el título del cuestionario
    let ul = document.createElement('ul');
    ul.textContent = tema;

    // Obtiene la etiqueta <nav>
    let nav = document.querySelector('nav');

    // Agrega el nuevo <ul> al final de la etiqueta <nav>
    nav.appendChild(ul);
}




