import express,{Router} from "express"
import expressWs from 'express-ws'
import cors from "cors"
import fs from 'fs'
import apiRouter from "./routers/api"
import path from "path"


const app = express()
const port = 3000
const carpetas = 'carpetas.json';

app.use(express.json())
app.use(cors({ origin:"http://localhost:5173", credentials:true}))

app.use("/api", apiRouter)

const { getWss, applyTo } = expressWs(app);
const qrRouter = Router()
function enviarListaImagenes(ws:any) {
    const rutaQrs = './qrs';
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
    enviarListaImagenes(ws);

    ws.on('open', () => {
        console.log('conectado con exito')
        ws.send('oli'); // Puedes enviar mensajes adicionales al abrir la conexión si es necesario
    });
})


app.get("/", async (req, res)=>{
    res.send("html")
})
applyTo(qrRouter)
app.use('/ws',qrRouter)


app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))