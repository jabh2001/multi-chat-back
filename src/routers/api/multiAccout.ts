import express from "express";
import fs from 'fs';

const multiAccountRoute = express.Router();
const port = 3000;

const carpetas = 'carpetas.json';

multiAccountRoute.post('/createCarpet', async (req, res) => {
    if (!fs.existsSync(carpetas)) {
        fs.writeFileSync(carpetas, '[]', 'utf-8');
    }
    try {
        const nuevaCarpeta = req.body.carpeta;
        const puerto = req.body.puerto;

        let jsonData;
        if (fs.existsSync(carpetas)) {
            jsonData = JSON.parse(fs.readFileSync(carpetas, 'utf-8'));
        } else {
            jsonData = [];
        }

        const carpetaExistente = jsonData.find((item:any) => item.carpeta === nuevaCarpeta);
        const puertoExiste = jsonData.find((item:any) => item.puerto === puerto);

        if (carpetaExistente || puertoExiste) {
            console.log('existe');
            return res.status(400).json(`La carpeta ${nuevaCarpeta} ya existe.`);
        }

        jsonData.push({ carpeta: nuevaCarpeta, puerto });

        fs.writeFileSync(carpetas, JSON.stringify(jsonData, null, 2), 'utf-8');

        res.json(`Creada: ${nuevaCarpeta}`);
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json('Error interno del servidor');
    }
});

export default multiAccountRoute;
