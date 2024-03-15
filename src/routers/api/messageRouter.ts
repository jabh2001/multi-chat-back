import { applyTo } from "../../app";
import { Router } from "express";
import { saveNewMessageInConversation } from "../../service/messageService";
import SocketPool from "../../libs/socketConnectionPool";
import { ContactType, MessageType } from "../../libs/schemas";

const messageWsRouter = Router()

messageWsRouter.ws('/conversation/:id', async (ws, rq) => {
    const poll = SocketPool.getInstance()
    console.log('conectado al mensaje')
    ws.on('message', async (data) => {
        try {
            const jsonData = JSON.parse(data.toString());
            const sender: ContactType = jsonData.sender

            console.log(sender)
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
            console.log(message)
            const baileys = poll.getBaileysConnection(jsonData.inbox)
            console.log(sender.phoneNumber)
            await baileys?.sendMessage(sender.phoneNumber.split('+')[1], message)
            const result = await saveNewMessageInConversation(rq.params.id, message)

            ws.send(JSON.stringify(result))


        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
    ws.on('mensajeRecibido',async(data)=>{
        console.log('se recibio del lado del server\n', data)
        let message:MessageType ={
            content:data.text,
            contentType:'text',
            conversationId:data.conversation.id,
            id:0,
            messageType:'incoming',
            private:true,
            senderId:data.id
        }
        console.log('mensaje del evento',message)
        const result = await saveNewMessageInConversation(rq.params.id, message)
        ws.send(JSON.stringify(result))


    })
})

applyTo(messageWsRouter)

export default messageWsRouter