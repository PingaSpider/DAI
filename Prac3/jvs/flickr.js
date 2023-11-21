function addFlickr(terminoBusqueda, imagenNodo) {
    const apiKey = '555283693c95b6b35bb3caaa52310fe1';
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
            console.error('Error al obtener datos de Flickr:', error);
            // Establecer una imagen predeterminada en caso de error o falta de resultados
            imagenNodo.src = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57723/globe_east_540.jpg';
        });
}