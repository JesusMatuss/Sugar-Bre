const fs = require('fs');

// Datos de medida_cm mapeados por ID
const medidas = {
  "HB-SM-01": "8", "HB-SM-03": "8", "HB-SM-06-N1": "11", "HB-SM-06-N5": "11",
  "HB-SM-04": "11", "HB-SM-05": "11", "HB-SM-06": "11", "HB-SM-06-N1-70": "11",
  "HB-SM-06-N2-70": "11", "HB-SM-07": "12", "HB-SM-08": "12", "HB-SM-09": "12",
  "HB-SM-09-N1": "12", "HB-SM-09-N2": "12", "HB-SM-10": "13", "HB-SM-11": "13",
  "HB-SM-12": "13", "HB-SM-12-N1": "13", "HB-SM-12-N2": "13", "HB-CM-01": "11",
  "HB-CM-02": "11", "HB-CM-03": "11", "HB-CM-03-N1": "11", "HB-CM-03-N2": "11",
  "HB-CM-03-N3": "11", "HB-CMT-01": "11", "HB-CMT-02": "11", "HB-CMT-03": "11",
  "HB-CM-04": "11", "HB-CM-05": "11", "HB-CM-06": "11", "HB-CM-06-N1": "11",
  "HB-CM-06-N2": "11", "HB-CM-06-N3": "11", "HB-CM-07": "13", "HB-CM-08": "13",
  "HB-CM-09": "13", "HB-CM-09-N1": "13", "HB-CM-09-N2": "13", "HB-CM-09-N3": "13",
  "HB-CMT-E01": "13", "HB-CMT-E02": "13", "HB-CMT-E03": "13",
  "PC-EST-01": "16", "PC-ESTT": "16", "PC-Mini": "12", "PC-COM-01": "16",
  "PC-COM-02": "16", "PC-COM-03": "16", "PC-COM-04": "16", "PC-COM-05": "16",
  "PC-COM-06": "16", "PC-COM-06-N1": "16", "PC-COM-06-N2": "16", "PC-COM-07": "16",
  "PC-COM-08": "16", "PC-COM-09": "16", "PC-COM-09-N1": "16", "PC-COM-09-N2": "16",
  "PC-JUM-01": "20", "PC-JUM-02": "20", "PC-JUM-03": "20", "PC-JUM-03-N1": "20",
  "PC-JUM-03-N2": "20", "PC-JUM-04": "21",
  "DL-PEP-01": "18", "DL-PEP-02": "18", "DL-PEP-03": "18", "DL-PEP-03-N1": "18",
  "DL-PEP-03-N2": "18", "DL-PEP-03-N3": "18", "DL-PEP-04": "22", "DL-PEP-05": "22",
  "DL-PEP-06": "22", "DL-PEP-06-N1": "22", "DL-PEP-06-N2": "22", "DL-PEP-06-N3": "22",
  "DL-PEP-07": "30", "DL-PEP-08": "30", "DL-PEP-09": "30", "DL-PEP-09-N1": "30",
  "DL-PEP-09-N2": "30", "DL-PEP-09-N3": "30", "DL-PEP-10": "15", "DL-PEP-11": "15",
  "DL-PEP-11-SN": "15", "DL-PEP-11-N1": "15", "DL-PEP-11-N2": "15", "DL-PEP-11-N3": "15",
  "DL-PEP-12": "30", "DL-PEP-13": "30", "DL-PEP-14": "30", "DL-PEP-14-N1": "30",
  "DL-PEP-14-N2": "30", "DL-PEP-14-N3": "30",
  "SW-BIM-01": "30", "SW-BIM-02": "30", "SW-BIM-03": "30", "SW-BIM-03-N1": "30",
  "SW-BIM-03-N2": "30", "SW-BIM-03-N3": "30",
  "HB-PP-SM-01": "11", "HB-PP-SM-02": "11", "HB-PP-CM-01": "11", "HB-PP-CM-02": "11",
  "HB-PP-CM-03": "11", "HB-PP-CM-04": "11", "HB-PP-CM-05": "13", "HB-PP-CM-06": "13",
  "PC-PP-70-01": "16", "PC-PP-70-02": "16", "PC-PP-55-01": "14.5", "PC-PP-55-02": "14.5"
};

const catalogo = JSON.parse(fs.readFileSync('./catalogo.json', 'utf8'));

catalogo.forEach(prod => {
    prod.toppings.forEach(t => {
        if(medidas[t.id]) {
            t.medida_cm = medidas[t.id];
        }
    });
});

fs.writeFileSync('./catalogo.json', JSON.stringify(catalogo, null, 2));
console.log('Medidas restauradas!');
