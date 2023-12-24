let cuestionarioCount = 1;  // Variable global para contar los cuestionario

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

     // Enviar el título del cuestionario al servidor y obtener un ID
     enviarCuestionarioAlServidor(titulo).then(data => {
         if (!data || !data.result) {
             // No lanzamos un error aquí, solo mostramos una alerta.
             alert('No se pudo agregar el cuestionario: ' + (data && data.error ? data.error : 'Error desconocido'));
             return; // Terminamos la ejecución aquí.
         }

         const idCuestionario = data.result.cuestionarioId;
         agregarCuestionario(titulo,idCuestionario);
    }).catch(error => {
            console.error('Error al agregar cuestionario:', error);
            alert('Hubo un error al agregar el cuestionario. Por favor, inténtalo de nuevo.');
    });

    // Limpiar los campos del formulario
    form.querySelector("[name='tema']").value = "";
}

// Función para agregar un cuestionario
function agregarCuestionario(titulo,idCuestionario) {

        // Crear el elemento del cuestionario y asignarle los atributos necesarios
        const nuevoCuestionario = document.createElement('section');
        nuevoCuestionario.dataset.tema = titulo; // Añadir data-tema
        nuevoCuestionario.dataset.cuestionarioId = idCuestionario; // Añadir data-id

        // Crear el nodo de la imagen
        const imagenNode = document.createElement('img');
        imagenNode.alt = `Imagen de ${titulo}`;
        imagenNode.src = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57723/globe_east_540.jpg';

        // Crear y configurar el componente 'encabezado-cuestionario'
        const encabezadoCuestionario = document.createElement('encabezado-cuestionario');
        encabezadoCuestionario.setAttribute('data-tema', titulo); // Este es tu elemento personalizado?
        nuevoCuestionario.appendChild(encabezadoCuestionario);

        // Añadir el nuevo cuestionario al final del contenido (antes del footer)
        const footer = document.querySelector('footer');
        document.body.insertBefore(nuevoCuestionario, footer);

        // Agregar el formulario de creación de preguntas
        const formulario = addFormPregunta(nuevoCuestionario);
        encabezadoCuestionario.insertAdjacentElement('afterend', formulario);

        // Actualizar el índice de navegación
        agregarAlIndice(titulo, idCuestionario);
}


function enviarCuestionarioAlServidor(titulo) {
    const url = `${base}/creacuestionario`; // Asegúrate de que la ruta coincide con la del servidor

    const datos = {
        tema: titulo 
    };
    

    return fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(datos),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 409) { // Conflicto, el cuestionario ya existe
            return response.json().then(err => {
                alert(`Error: ${err.error}`);
                return Promise.reject(new Error('Error al crear el cuestionario: ya existe')); // Rechazamos la promesa sin lanzar el error
            });
        } else {
            // Otros errores que no sean 409
            return response.json().then(err => {
                alert(`Error: ${err.error}`);
                return Promise.reject(new Error('Error al crear el cuestionario')); // Rechazamos la promesa sin lanzar el error
            });
        }
    })
    .catch(error => {
        // Manejar errores de red o si un error fue rechazado en la promesa
        alert(`Error al enviar el cuestionario al servidor: ${error.message}`);
        // No lanzamos el error, simplemente terminamos la ejecución aquí.
        // Si necesitas hacer algo más después del error, aquí es donde lo harías.
    });
}


function agregarAlIndice(titulo, idCuestionario) {
    let index = document.querySelector('nav').querySelector('ul');
    index.innerHTML += `<li><a href="#${idCuestionario}">${titulo}</a></li>`;
}






