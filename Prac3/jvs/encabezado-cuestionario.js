
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
            <h2><img src="imagen_por_defecto.jpg" alt="Imagen de ${tema}">Cuestionario sobre ${tema}</h2>
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
