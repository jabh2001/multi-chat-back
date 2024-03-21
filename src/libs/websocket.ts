import { saveNewMessageInConversation } from "../service/messageService"
import { ContactType, MessageType } from "./schemas"

export default class WS {

    static async incomingMessage(data: any, rq: any,) {
        let message: MessageType = {
            whatsappId:'',
            content: data.text,
            contentType: 'text',
            conversationId: data.conversation.id,
            id: 0,
            messageType: data.fromMe === true ? 'outgoing' : 'incoming',
            private: true,
            senderId: data.id
        }
        const result = await saveNewMessageInConversation(rq.params.id, message)
        return JSON.stringify(result)
    }
    static async outgoingMessage(data: any, baileys: any, rq: any) {
        const sender: ContactType = data.sender

        const conversationId = data.conversationId
        const messageType = data.messageType
        let message: MessageType = {
            whatsappId:'',
            id: 0,
            conversationId: conversationId,
            contentType: 'text',
            content: data.message,
            private: true,
            senderId: sender.id,
            messageType: messageType
        }
        const wsMessage = await baileys?.sendMessage(sender.phoneNumber.split('+')[1], message)

        message.whatsappId = wsMessage.key.id
        const result = await saveNewMessageInConversation(rq.params.id, message)
        return result
    }
    static async outgoingMessageFromWS(data: any, rq:any) {
        const conversationId = data.conversation.id
        let message: MessageType = {
            id: 0,
            conversationId: conversationId,
            contentType: 'text',
            content: data.text,
            private: true,
            messageType: "outgoing",
            whatsappId: data.messageID
        }
        const result = await saveNewMessageInConversation(rq.params.id, message)
        return JSON.stringify(result)

    }
}
