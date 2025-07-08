function addFlickr(terminoBusqueda, imagenNodo) {
    const apiKey = '32a4acfc301f0d0b498d20c522f2a244';
    const flickrSearchURL = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&text=${encodeURIComponent(terminoBusqueda)}&format=json&per_page=1&media=photos&sort=relevance&nojsoncallback=1`;

    // Realizar la primera solicitud para buscar fotos en Flickr
    fetch(flickrSearchURL)
        .then(response => response.json())
        .then(data => {
            // Verificar si se encontraron fotos
            if (data.photos.photo.length > 0) {
                const photo = data.photos.photo[0];
                // Construir URL para obtener tamaños de la foto
                const flickrSizesURL = `https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=${apiKey}&photo_id=${photo.id}&format=json&nojsoncallback=1`;

                // Realizar la segunda solicitud para obtener la URL de la imagen
                return fetch(flickrSizesURL);
            } else {
                throw new Error('No se encontraron fotos');
            }
        })
        .then(response => response.json())
        .then(data => {
            // Encontrar la imagen de menor tamaño (o el tamaño deseado)
            const imageUrl = data.sizes.size[0].source;
            // Actualizar el atributo src del nodo de la imagen
            imagenNodo.src = imageUrl;
        })
        .catch(error => {
            console.log('Error al obtener datos de Flickr:', error);
            // Establecer una imagen predeterminada en caso de error o falta de resultados
            imagenNodo.src = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57723/globe_east_540.jpg';
        });
}


function addWikipedia(terminoBusqueda, componente) {
    const wikipediaURL = `https://es.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&continue&titles=${encodeURIComponent(terminoBusqueda)}`;

    fetch(wikipediaURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Respuesta de la red no fue ok');
            }
            return response.json();
        })
        .then(data => {
            const page = data.query.pages[Object.keys(data.query.pages)[0]];
            if (page.extract) {
                const cleanText = page.extract.replace(/\[\d+\]/g, '');
                // Accede al shadowRoot del componente para encontrar el div .wiki y actualizar su contenido
                const wikiDiv = componente.shadowRoot.querySelector('.wiki');
                wikiDiv.textContent = cleanText;
            }
        })
        .catch(error => {
            console.error('Fallo en la petición a Wikipedia:', error);
            // En caso de error, podría ser necesario manejar el estado de error dentro del componente
            const wikiDiv = componente.shadowRoot.querySelector('.wiki');
            wikiDiv.textContent = 'Información no disponible.';
        });
}



class EncabezadoCuestionario extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const tema = this.getAttribute('data-tema');
        this.render(tema);
    }

    static get observedAttributes() {
        return ['data-tema']; // Observa solo el atributo 'data-tema'
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-tema' && oldValue !== newValue) {
            this.render(newValue);
        }
    }

    render(tema) {
        // Definir estilos y contenido inicial
        this.shadowRoot.innerHTML = `
            <style>.wiki {
                font-size: 90%;
            }
            h2 img {
                vertical-align: text-top;
                width: 50px;
                height: 50px;
                margin-right: 10px;
                border: 1px solid lightgray;
            }</style>
            <h2><img src="https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57723/globe_east_540.jpg" alt="Imagen de ${tema}">Cuestionario sobre ${tema}</h2>
            <div class="wiki"></div>
        `;
    
        // Asegúrate de llamar a estas funciones aquí para que el contenido del shadowRoot ya esté establecido.
        this.updateImage(tema);
        this.updateDescription(tema);
    }
    

    updateImage(tema) {
        // Obtener el nodo de la imagen del shadow DOM
        const imagenNodo = this.shadowRoot.querySelector('img');
    
        // Llamar a addFlickr y pasarle el nodo de la imagen directamente
        addFlickr(tema, imagenNodo);
    }
    
    
    updateDescription(tema) {
        // Llamar a addWikipedia y pasarle una referencia al componente
        addWikipedia(tema, this);
    }
    
}

customElements.define('encabezado-cuestionario', EncabezadoCuestionario);
