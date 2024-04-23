import { applyTo } from "../../app";
import { Router } from "express";
import SocketPool from "../../libs/socketConnectionPool";
import WS from "../../libs/websocket";
import { getAsignedUserByIdSchema, getInboxConversationAndContactById, updateInboxConversation } from "../../service/conversationService";
import { ConversationSchemaType } from "../../libs/schemas";
import { getInboxByName } from "../../service/inboxService";

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
                console.log(conversation)
                delete conversation.contact
                console.log(conversation)
                await updateInboxConversation(conversation.id!, conversation)

                
            }
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