// Funciones de utilidad para el manejo del DOM
//Inserta un nodo como último hijo de otro
function insertAsLastChild(padre, nuevoHijo) {
    padre.append(nuevoHijo);
}

//Inserta un nodo como primer hijo de otro
function insertAsFirstChild(padre, nuevoHijo) {
    padre.prepend(nuevoHijo);
}

//Inserta un nodo como hermano anterior de otro
function insertBeforeChild(padre, hijo, nuevoHijo) {
    padre.insertBefore(nuevoHijo, hijo);
}

//Inserta un nodo como hermano posterior de otro
function removeElement(nodo) {
    nodo.remove();
}

//Selecciona un ancestro de un nodo que cumpla un selector
function queryAncestorSelector(node, selector) {
    var parent = node.parentNode;
    var all = document.querySelectorAll(selector);
    var found = false;
    while (parent !== document && !found) {
        for (var i = 0; i < all.length && !found; i++) {
            found = (all[i] === parent);
        }
        parent = (!found) ? parent.parentNode : parent;
    }
    return (found) ? parent : null;
}

