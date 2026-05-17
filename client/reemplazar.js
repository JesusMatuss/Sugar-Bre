// Reemplazamos catalogo.json por catalogo_nuevo.json
const fs = require('fs');
fs.renameSync('./catalogo_nuevo.json', './catalogo.json');
console.log('Catálogo actualizado');
