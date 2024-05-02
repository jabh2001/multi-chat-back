import { applyTo, getClientList } from "../../app";
import { Router } from "express";
import SocketPool from "../../libs/socketConnectionPool";
import WS from "../../libs/websocket";
import { getAsignedUserByIdSchema, updateInboxConversation } from "../../service/conversationService";
import { getInboxByName } from "../../service/inboxService";

const clients = getClientList()
const messageWsRouter = Router()

messageWsRouter.ws('/conversation/:id', async (ws, rq) => {
    const poll = SocketPool.getInstance()
    ////
    // este es el que se debe enviar a baileys
    ////
    ws.on('message', async (data) => {
        try {
            const jsonData = JSON.parse(data.toString());
            if(jsonData.assignedUserId == null){
                const inbox = await getInboxByName(jsonData.inbox);
                const conversation = await getAsignedUserByIdSchema(inbox.id, jsonData.contact.id) as any
                conversation.assignedUserId = jsonData.user.id
                delete conversation.contact
                await updateInboxConversation(conversation.id!, conversation)
                clients.emitToClients("update-conversation", conversation)

            }
            const baileys = poll.getBaileysConnection(jsonData.inbox)
            if(!baileys){
                return 
            }
            const result = await WS.outgoingMessage(jsonData, baileys)
            if(Array.isArray(result)){
                for(const res of result){
                    ws.send(JSON.stringify(res))
                }
            } else {

                ws.send(JSON.stringify(result))
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
    ws.on('message-upsert'+rq.params.id,async(data: string)=>{
        ws.send(data)   
    })
})

applyTo(messageWsRouter)

export default messageWsRouter