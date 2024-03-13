
import fs from 'fs'
import { Router } from "express"

import SocketPool from "../../libs/socketConnectionPool"
import expressWs from "express-ws";
import { ServerSentEventClient } from "../../libs/express-sse/ServerSentEventClient";
import { SSERouter, getClientList } from "../../app";
import { MessageType } from '../../libs/schemas' 


const testRouter = Router()
const sseRouter = SSERouter()
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
    
    // .post(async (req, res) => {
    //     try {
    //         const { number, message, } = req.body;
    //         const test = SocketPool.getInstance();
    //         const prueba_ = test.getBaileysConnection(nombre);
    //         // await prueba_.start();

    //         const mensaje: MessageType = {
    //             contentType:"text",

    //             id: 1,
    //             content: message,
    //             private: true,
                
    //         };

    //         await prueba_?.sendMessage(number, mensaje);
    //         res.json({ mensaje: "se envió el mensaje" });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ error: "Hubo un error al procesar la solicitud" });
    //     }
    // }
    // );



    testRouter.route('/all').get(async (req, res) => {
        try {
            const allSessions = fs.readdirSync('./sessions');
            console.log(allSessions);
    
            for (const sessionName of allSessions) {
                const instance = SocketPool.getInstance();
                const session = instance.createBaileysConnection(sessionName);
                console.log(session);
    
                if (session) {
                    await session.start();
                }
            }
    
            res.json({ message: 'Sesiones iniciadas' });
        } catch (error) {
            console.error('Error al iniciar sesiones:', error);
            res.status(500).json({ error: 'Error al iniciar sesiones' });
        }
    }
    );

    
export default testRouter