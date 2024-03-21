import { applyTo } from "../../app";
import { Router } from "express";
import SocketPool from "../../libs/socketConnectionPool";
import WS from "../../libs/websocket";

const messageWsRouter = Router()

messageWsRouter.ws('/conversation/:id', async (ws, rq) => {
    const poll = SocketPool.getInstance()
    console.log('conectado al mensaje')
    ////
    // este es el que se debe enviar a baileys
    ////
    ws.on('message', async (data) => {
        try {
            const jsonData = JSON.parse(data.toString());
            const baileys = poll.getBaileysConnection(jsonData.inbox)
            const result = await WS.outgoingMessage(jsonData, baileys, rq)
            ws.send(JSON.stringify(result))
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
    ws.on('message-upsert'+rq.params.id,async(data)=>{
        if(data.fromMe){
            const mensaje = await WS.outgoingMessageFromWS(data,rq)
            console.log('esto es lo que se enviará', mensaje)
            ws.send(mensaje)
        }else{

            const mensaje = await WS.incomingMessage(data, rq)
            ws.send(mensaje)
        }       
    })
})

applyTo(messageWsRouter)

export default messageWsRouter