import { Router } from "express";
import fs from 'fs'
import path from "path"
import { applyTo } from "../../app";
import { getInboxes } from "../../service/inboxService";


const qrRouter = Router()
const rutaQrs = './qrs';
async function enviarListaImagenes(ws:any) {
    const archivos = fs.readdirSync(rutaQrs);
    const inboxes = await getInboxes()
    const imagenesBase64:object[] = [];

    inboxes.forEach((inbox:any) => {
        const rutaQr = path.join(rutaQrs, `qr-${inbox.name}.png`);
        const contenido = fs.readFileSync(rutaQr, { encoding: 'base64' });

        imagenesBase64.push({
            nombre: inbox.name,
            contenido: contenido,
            user: !!inbox.user
        });
    });

    ws.send(JSON.stringify(imagenesBase64));
}

qrRouter.ws('/qr',(ws,rq)=>{
    console.log("iniciando el socket");
    
    ws.addEventListener("message", (e)=>{
    })
    enviarListaImagenes(ws);
    ws.on('message',(message)=>{
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