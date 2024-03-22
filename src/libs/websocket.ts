import { Request } from "express"
import { saveNewMessageInConversation } from "../service/messageService"
import { WSMessageUpsertType } from "../types"
import { ContactType, MessageType } from "./schemas"

export default class WS {

    static async incomingMessage(data: WSMessageUpsertType) {
        let message: Omit<MessageType, "id"> = {
            whatsappId:data.messageID,
            content: String(data.text),
            contentType: 'text',
            conversationId: data.conversation.id,
            messageType: data.fromMe === true ? 'outgoing' : 'incoming',
            private: true,
        }
        const result = await saveNewMessageInConversation(data.conversation.id, message)
        return JSON.stringify(result)
    }
    static async outgoingMessage(data: any, baileys: any) {
        const sender: ContactType = data.sender

        const conversationId = data.conversationId
        let message: Omit<MessageType, "id"> = {
            whatsappId:'',
            conversationId: conversationId,
            contentType: 'text',
            content: data.message,
            private: true,
            messageType: "outgoing"
        }
        const wsMessage = await baileys?.sendMessage(sender.phoneNumber.split('+')[1], message)

        message.whatsappId = wsMessage.key.id
        const result = await saveNewMessageInConversation(conversationId, message)
        return result
    }
    static async outgoingMessageFromWS(data: WSMessageUpsertType) {
        const conversationId = data.conversation.id
        let message: Omit<MessageType, "id"> = {
            conversationId,
            contentType: 'text',
            content: String(data.text),
            private: false,
            messageType: "outgoing",
            whatsappId: data.messageID
        }
        const result = await saveNewMessageInConversation(conversationId, message)
        return JSON.stringify(result)

    }
}
