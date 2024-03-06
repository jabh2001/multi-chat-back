
import { Router } from "express"
import SocketPool from "../../libs/socketConnectionPool"
import { MessageType } from "../../types"
import expressWs from "express-ws";
const testRouter = Router()
let nombre = ''

testRouter.route("/")

    .get(async (req, res) => {
        nombre = req.body.nombre
        const test = SocketPool.getInstance()
        const prueba_ = test.createBaileysConnection(nombre)
        console.log(prueba_)
        await prueba_.start()
        res.json({ 'mensaje': 'esta es la prueba' })
    })
    .post(async (req, res) => {
        try {
            const { number, message, } = req.body;
            const test = SocketPool.getInstance();
            const prueba_ = test.getBaileysConnection(nombre);
            // await prueba_.start();

            const mensaje: MessageType = {
                id: 1,
                content: message,
                content_type: "text",
                message_type: "incoming",
                private: true,
                created_at: new Date(),
                user: {
                    email: "xxx@xx.com",
                    id: 1,
                    name: "nombre",
                    role: "admin",
                    teams: [
                        {
                            description: "hello",
                            id: 1,
                            name: "hello"
                        }
                    ]
                }
            };

            await prueba_?.sendMessage(number, mensaje);
            res.json({ mensaje: "se envió el mensaje" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Hubo un error al procesar la solicitud" });
        }
    }
    );



// testRouter.ws("/websocket", (ws, req) => {
//     // WebSocket logic here
//     // Access ws for handling WebSocket connections
//     ws.on("message", (msg) => {
//         // Handle incoming WebSocket messages
//     });

//     // You can also access req for handling request-related information
//     // req.body, req.query, etc.

//     // Send a message to the client
//     ws.send("WebSocket connection established");
// });
export default testRouter