import { saveNewMessageInConversation } from "../service/messageService"
import { ContactType, MessageType } from "./schemas"

export default class WS {

    static async incomingMessage(data: any, rq: any,) {
        let message: MessageType = {
            content: data.text,
            contentType: 'text',
            conversationId: data.conversation.id,
            id: 0,
            messageType: 'incoming',
            private: true,
            senderId: data.id
        }
        const result = await saveNewMessageInConversation(rq.params.id, message)
        return JSON.stringify(result)
    }
    static async outgoingMessage(data:any, baileys:any, rq:any) {
        const sender: ContactType = data.sender

        const conversationId = data.conversationId
        const messageType = data.messageType
        let message: MessageType = {
            id: 0,
            conversationId: conversationId,
            contentType: 'text',
            content: data.message,
            private: true,
            senderId: sender.id,
            messageType: messageType

        }
        await baileys?.sendMessage(sender.phoneNumber.split('+')[1], message)
        const result = await saveNewMessageInConversation(rq.params.id, message)
        return result

    }

}
