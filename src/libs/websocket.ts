import { Request } from "express"
import { saveNewMessageInConversation } from "../service/messageService"
import { AgentType, WSMessageUpsertType } from "../types"
import { ContactType, MessageType } from "./schemas"

export default class WS {

    static async incomingMessage(data: WSMessageUpsertType) {
        let buffer: undefined|string=undefined
        let bufferType :undefined|string=undefined
        if(data.base64Buffer){
            buffer = data.base64Buffer.base64===null?undefined:data.base64Buffer.base64
            bufferType=data.base64Buffer.tipo===null?undefined:data.base64Buffer.tipo
        }
        let message: Omit<MessageType, "id"> = {
            whatsappId:data.messageID,
            content: String(data.text),
            contentType: data.base64Buffer===null?'text':bufferType!,
            conversationId: data.conversation.id,
            messageType: data.fromMe === true ? 'outgoing' : 'incoming',
            private: true,
            buffer:buffer,
        }
        const result = await saveNewMessageInConversation(data.conversation.id, message)
        return JSON.stringify(result)
    }
    static async outgoingMessage(data: any, baileys: any) {
        const contact: ContactType = data.contact
        const user: AgentType = data.user

        const conversationId = data.conversationId
        let message: Omit<MessageType, "id"> = {
            senderId:data.sender,
            whatsappId:'',
            conversationId: conversationId,
            contentType: 'text',
            content: data.message,
            private: true,
            messageType: "outgoing",
            buffer:data.base64Buffer
        }
        const wsMessage = await baileys?.sendMessage(contact.phoneNumber.split('+')[1], message)

        message.whatsappId = wsMessage.key.id
        const result = await saveNewMessageInConversation(conversationId, message)
        return { ...result, user }
    }
    static async outgoingMessageFromWS(data: WSMessageUpsertType) {
        let buffer: undefined|string=undefined
        let bufferType :undefined|string=undefined
        let captionText : undefined | null | string = undefined
        if(data.base64Buffer){
            buffer = data.base64Buffer.base64===null?undefined:data.base64Buffer.base64
            bufferType=data.base64Buffer.tipo===null?undefined:data.base64Buffer.tipo
            captionText = data.base64Buffer.caption
        }
        const conversationId = data.conversation.id
        let message: Omit<MessageType, "id"> = {
            conversationId,
            contentType: data.base64Buffer===null?'text':bufferType!,
            content: captionText ?? String(data.text),
            private: false,
            messageType: "outgoing",
            whatsappId: data.messageID,
            buffer:buffer,
        } 
        const result = await saveNewMessageInConversation(conversationId, message)
        return JSON.stringify(result)
        
    }
}
