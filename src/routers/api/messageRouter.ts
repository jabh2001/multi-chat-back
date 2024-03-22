import { applyTo } from "../../app";
import { Router } from "express";
import SocketPool from "../../libs/socketConnectionPool";
import WS from "../../libs/websocket";
import { ContactType, WSMessageUpsertType } from "../../types";

const messageWsRouter = Router()

messageWsRouter.ws('/conversation/:id', async (ws, rq) => {
    const poll = SocketPool.getInstance()
    ////
    // este es el que se debe enviar a baileys
    ////
    ws.on('message', async (data) => {
        try {
            const jsonData = JSON.parse(data.toString());
            const baileys = poll.getBaileysConnection(jsonData.inbox)
            const result = await WS.outgoingMessage(jsonData, baileys)
            ws.send(JSON.stringify(result))
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
    // { ...result, text, fromMe, messageID:m.key.id }
    ws.on('message-upsert'+rq.params.id,async(data: string)=>{
        ws.send(data)   
    })
})

applyTo(messageWsRouter)

export default messageWsRouter