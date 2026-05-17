const fs = require('fs');

// Mapa de detalles técnicos por ID
const detalles = {
  "HB-SM-01": { peso: "50", medida: "8" },
  "HB-SM-03": { peso: "50", medida: "8" },
  "HB-SM-06-N1": { peso: "60", medida: "11" },
  "HB-SM-06-N5": { peso: "60", medida: "11" },
  "HB-SM-04": { peso: "70", medida: "11" },
  "HB-SM-05": { peso: "70", medida: "11" },
  "HB-SM-06": { peso: "70", medida: "11" },
  "HB-SM-06-N1-70": { peso: "70", medida: "11" },
  "HB-SM-06-N2-70": { peso: "70", medida: "11" },
  "HB-SM-07": { peso: "90", medida: "12" },
  "HB-SM-08": { peso: "90", medida: "12" },
  "HB-SM-09": { peso: "90", medida: "12" },
  "HB-SM-09-N1": { peso: "90", medida: "12" },
  "HB-SM-09-N2": { peso: "90", medida: "12" },
  "HB-SM-10": { peso: "110", medida: "13" },
  "HB-SM-11": { peso: "110", medida: "13" },
  "HB-SM-12": { peso: "110", medida: "13" },
  "HB-SM-12-N1": { peso: "110", medida: "13" },
  "HB-SM-12-N2": { peso: "110", medida: "13" },
  "HB-CM-01": { peso: "90", medida: "11" },
  "HB-CM-02": { peso: "90", medida: "11" },
  "HB-CM-03": { peso: "90", medida: "11" },
  "HB-CM-03-N1": { peso: "90", medida: "11" },
  "HB-CM-03-N2": { peso: "90", medida: "11" },
  "HB-CM-03-N3": { peso: "90", medida: "11" },
  "HB-CMT-01": { peso: "90", medida: "11" },
  "HB-CMT-02": { peso: "90", medida: "11" },
  "HB-CMT-03": { peso: "90", medida: "11" },
  "HB-CM-04": { peso: "110", medida: "11" },
  "HB-CM-05": { peso: "110", medida: "11" },
  "HB-CM-06": { peso: "110", medida: "11" },
  "HB-CM-06-N1": { peso: "110", medida: "11" },
  "HB-CM-06-N2": { peso: "110", medida: "11" },
  "HB-CM-06-N3": { peso: "110", medida: "11" },
  "HB-CM-07": { peso: "120", medida: "13" },
  "HB-CM-08": { peso: "120", medida: "13" },
  "HB-CM-09": { peso: "120", medida: "13" },
  "HB-CM-09-N1": { peso: "120", medida: "13" },
  "HB-CM-09-N2": { peso: "120", medida: "13" },
  "HB-CM-09-N3": { peso: "120", medida: "13" },
  "HB-CMT-E01": { peso: "120", medida: "13" },
  "HB-CMT-E02": { peso: "120", medida: "13" },
  "HB-CMT-E03": { peso: "120", medida: "13" }
};

const catalogo = JSON.parse(fs.readFileSync('./catalogo.json', 'utf8'));

catalogo.forEach(prod => {
    prod.toppings.forEach(t => {
        if(detalles[t.id]) {
            t.peso_gr = detalles[t.id].peso;
            t.medida_cm = detalles[t.id].medida;
        }
    });
});

fs.writeFileSync('./catalogo.json', JSON.stringify(catalogo, null, 2));
console.log('Detalles técnicos restaurados!');
