import { applyTo } from "../app";
import { Router } from "express";
import { saveNewInbox } from "./inboxService";
import { saveNewMessageInConversation } from "./messageService";
import { MessageType } from "../libs/schemas";

const messageWsRouter = Router()

messageWsRouter.ws('/conversation/:id',async(ws, rq)=>{
    console.log('conectado al mensaje')
    ws.on('message',async (data) => {
        try {
            const jsonData = JSON.parse(data.toString());

            const sender = jsonData.sender
            const conversationId = jsonData.conversationId
            const messageType = jsonData.messageType
            let message:MessageType = {
                id:0,
                conversationId:conversationId,
                contentType:'text',
                content:jsonData.message,
                private:true,
                senderId:sender,
                messageType:messageType
                
            }
            console.log(message)
            const result = await saveNewMessageInConversation(rq.params.id,message )
            
            ws.send(JSON.stringify(result))
            

        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
})

applyTo(messageWsRouter)

export default messageWsRouter