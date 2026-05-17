require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../client')));

// Ruta para forzar el uso de la carpeta correcta si fuera necesario
app.use('/imagenes', express.static(path.join(__dirname, '../client/imagenes')));

const PORT = process.env.PORT || 3000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Configurar autenticación
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Endpoint para guardar pedidos
app.post('/api/pedidos', async (req, res) => {
    try {
        const sheets = google.sheets({ version: 'v4', auth });
        const {
            cliente, nombre, especificacion, peso, topping,
            paquetes, precioTotal, numero, fechaEntrega, delivery
        } = req.body;

        const values = [[
            cliente, nombre, especificacion, peso, topping,
            paquetes, precioTotal, numero, new Date().toLocaleString(), fechaEntrega, delivery
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Productos!A:K',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        res.status(200).json({ message: 'Pedido guardado con éxito' });
    } catch (error) {
        console.error('Error al guardar en Google Sheets:', error);
        res.status(500).json({ error: 'Error al procesar el pedido' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
