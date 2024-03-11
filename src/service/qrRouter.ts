import { Router } from "express";
import fs from 'fs'
import path from "path"
import { applyTo } from "../app";


const qrRouter = Router()
const rutaQrs = './qrs';
function enviarListaImagenes(ws:any) {
    const archivos = fs.readdirSync(rutaQrs);
    const imagenesBase64:object[] = [];

    archivos.forEach((qr) => {
        const rutaQr = path.join(rutaQrs, qr);
        const contenido = fs.readFileSync(rutaQr, { encoding: 'base64' });

        imagenesBase64.push({
            nombre: qr,
            contenido: contenido,
        });
    });

    ws.send(JSON.stringify(imagenesBase64));
}

qrRouter.ws('/qr',(ws,rq)=>{
    console.log("iniciando el socket");
    
    ws.addEventListener("message", (e)=>{
        console.log('Mensaje recibido en /qr', e.data)
    })
    enviarListaImagenes(ws);
    ws.on('message',(message)=>{
        console.log({message, onMessage:true})
        ws.send(message)
    })

    const watcher = fs.watch(rutaQrs);

    watcher.on('change', (eventType, filename) => {
        console.log(`Algo cambió en la carpeta: ${filename}`);
        // Ejecuta tu función cuando haya un cambio en la carpeta
        enviarListaImagenes(ws); // Puedes adaptar esto según tus necesidades
    });

})


applyTo(qrRouter)
export default qrRouter