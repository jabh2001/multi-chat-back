import { applyTo } from "../app";
import { Router } from "express";
import { saveNewMessageInConversation } from "./messageService";
import SocketPool from "../libs/socketConnectionPool";
import { ContactType, MessageType } from "../libs/schemas";

const messageWsRouter = Router()

messageWsRouter.ws('/conversation/:id', async (ws, rq) => {
    const poll = SocketPool.getInstance()
    console.log('conectado al mensaje')
    ws.on("evento", (...e)=>{
        console.log({"onEvento": e})
    })  
    ws.addListener("evento", (...e)=>{
        console.log({"listener": e})
    })  
    ws.on('message', async (data) => {
        try {
            const jsonData = JSON.parse(data.toString());

            const sender: ContactType = jsonData.sender
            const conversationId = jsonData.conversationId
            const messageType = jsonData.messageType
            let message: MessageType = {
                id: 0,
                conversationId: conversationId,
                contentType: 'text',
                content: jsonData.message,
                private: true,
                senderId: sender.id,
                messageType: messageType

            }
            const baileys = poll.getBaileysConnection(jsonData.inbox)

            const msg = await baileys?.sendMessage(sender.phoneNumber.split('+')[1], message)
            console.log({ msg })
            const result = await saveNewMessageInConversation(rq.params.id, message)

            ws.send(JSON.stringify(result))


        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
})

applyTo(messageWsRouter)

export default messageWsRouter