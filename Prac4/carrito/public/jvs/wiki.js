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

