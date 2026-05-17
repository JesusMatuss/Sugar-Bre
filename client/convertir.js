const fs = require('fs');

const catalogo = JSON.parse(fs.readFileSync('./catalogo.json', 'utf8'));

// Agrupamos por producto
const nuevoCatalogo = catalogo.reduce((acc, curr) => {
    const key = curr.producto;
    if (!acc[key]) {
        acc[key] = {
            id: key.toLowerCase().replace(/ /g, '-'),
            producto: key,
            categoria: curr.categoria,
            toppings: []
        };
    }
    acc[key].toppings.push({
        nombre: curr.topping,
        precio: parseFloat(curr.precio),
        id: curr.id // Guardamos el ID original por si acaso
    });
    return acc;
}, {});

fs.writeFileSync('./catalogo_nuevo.json', JSON.stringify(Object.values(nuevoCatalogo), null, 2));
console.log('Archivo convertido!');
