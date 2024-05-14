import fs from 'fs'
import { saveNewMessageInConversation } from "../service/messageService"
import { AgentType, WSMessageUpsertType } from "../types"
import { ContactType, FastMediaMessageType, MessageType } from "./schemas"
import { WhatsAppBaileysSocket } from './socketConnectionPool'
import { getFastMediaMessageById, getFastMessageById } from '../service/fastMessageService'

export default class WS {

    static async incomingMessage(data: WSMessageUpsertType) {
        let buffer: undefined | string = undefined
        let bufferType: undefined | string = undefined
        if (data.base64Buffer) {
            buffer = data.base64Buffer.base64 === null ? undefined : data.base64Buffer.base64
            bufferType = data.base64Buffer.tipo === null ? undefined : data.base64Buffer.tipo
        }
        let message: Omit<MessageType, "id"> = {
            whatsappId: data.messageID,
            content: String(data.text),
            contentType: data.base64Buffer === null ? 'text' : bufferType!,
            conversationId: data.conversation.id,
            messageType: data.fromMe === true ? 'outgoing' : 'incoming',
            private: true,
            buffer: buffer,
        }
        const result = await saveNewMessageInConversation(data.conversation.id, message)
        return JSON.stringify(result)
    }
    static async outgoingMessage(data: any, baileys: WhatsAppBaileysSocket) {
        const contact: ContactType = data.contact
        const user: AgentType = data.user

        const conversationId = data.conversationId

        let message: Omit<MessageType, "id"> = {
            senderId: data.sender,
            whatsappId: '',
            conversationId: conversationId,
            contentType: 'text',
            content: data.message,
            private: true,
            messageType: "outgoing",
            buffer: data.base64Buffer,
        }
        if (data.listBufferBase64 !== undefined && Array.isArray(data.listBufferBase64) && data.listBufferBase64.length > 0) {
            const list: MessageType["listBufferBase64"] = data.listBufferBase64
            const returnedList: any[] = []
            if (list === undefined) {
                return []
            }
            for (const m of list) {
                let wsMessage = {} as any
                const bufferSinComa = m.base64.split(',')[1]
                const buffer = Buffer.from(bufferSinComa, 'base64');
                message.buffer = m.base64.split(",")[1]
                if (m.tipo.match(/video*/)) {
                    message.contentType = "videoMessage"
                    wsMessage = await baileys.sendMediaMessage(
                        contact.phoneNumber.split('+')[1],
                        {
                            video: buffer,
                            caption: m.caption || '',
                        }
                    )
                } else if (m.tipo.match(/image*/)) {
                    message.contentType = "imageMessage"
                    message.content = m.caption
                    wsMessage = await baileys.sendMediaMessage(
                        contact.phoneNumber.split('+')[1],
                        {
                            image: buffer,
                            caption: m.caption || '',
                        }
                    )

                } else if (m.tipo.match(/audio*/)) {
                    message.contentType = "audioMessage"
                    wsMessage = await baileys.sendMediaMessage(
                        contact.phoneNumber.split('+')[1],
                        {
                            audio: buffer,
                        }
                    )
                } else if (m.tipo.match(/document*/)) {
                    message.contentType = "documentMessage"
                    wsMessage = contact.phoneNumber.split('+')[1],
                    {
                        document: buffer,
                    }
                }
                message.whatsappId = wsMessage.key.id
                const result = await saveNewMessageInConversation(conversationId, message)
                returnedList.push({ ...result, user })
            }
            return returnedList
        } else if (data.fastMessage) {

            const fastMedia = await getFastMessageById(data.fastMessage)
            const returnedList: any[] = []
            for (const m of fastMedia.fastMediaMessages!) {
                message.buffer = undefined
                message.content=  ""
                let wsMessage = {} as any
                if (m.base64) {
                    const bufferSinComa = m.base64.split(',')[1]
                    const buffer = Buffer.from(bufferSinComa, 'base64');
                    message.buffer = m.base64.split(",")[1]
                    if (m.messageType.match(/video*/)) {
                        message.contentType = "videoMessage"
                        wsMessage = await baileys.sendMediaMessage(
                            contact.phoneNumber.split('+')[1],
                            {
                                video: buffer,
                                caption: m.text || '',
                            }
                        )
                    } else if (m.messageType.match(/image*/)) {
                        message.contentType = "imageMessage"
                        message.content = m.text
                        wsMessage = await baileys.sendMediaMessage(
                            contact.phoneNumber.split('+')[1],
                            {
                                image: buffer,
                                caption: m.text || '',
                            }
                        )

                    } else if (m.messageType.match(/audio*/)) {
                        message.contentType = "audioMessage"
                        wsMessage = await baileys.sendMediaMessage(
                            contact.phoneNumber.split('+')[1],
                            {
                                audio: buffer,
                            }
                        )
                    } else if (m.messageType.match(/document*/)) {
                        message.contentType = "documentMessage"
                        wsMessage = contact.phoneNumber.split('+')[1],
                        {
                            document: buffer,
                        }
                    }
                    message.whatsappId = wsMessage.key.id
                    const result = await saveNewMessageInConversation(conversationId, message)
                    returnedList.push({ ...result, user })
                } else {
                    message.contentType = "text"
                    message.content = m.text
                    wsMessage = await baileys?.sendMessage(contact.phoneNumber.split('+')[1], message)

                    message.whatsappId = wsMessage.key.id
                    const result = await saveNewMessageInConversation(conversationId, message)
                    returnedList.push({ ...result, user })
                }
            }
            return returnedList
        } else {
            let wsMessage

            wsMessage = await baileys?.sendMessage(contact.phoneNumber.split('+')[1], message)

            message.whatsappId = wsMessage.key.id
            const result = await saveNewMessageInConversation(conversationId, message)
            return { ...result, user }
        }

    }
    static async outgoingMessageFromWS(data: WSMessageUpsertType) {
        let buffer: undefined | string = undefined
        let bufferType: undefined | string = undefined
        let captionText: undefined | null | string = undefined
        if (data.base64Buffer) {
            buffer = data.base64Buffer.base64 === null ? undefined : data.base64Buffer.base64
            bufferType = data.base64Buffer.tipo === null ? undefined : data.base64Buffer.tipo
            captionText = data.base64Buffer.caption
        }
        const conversationId = data.conversation.id
        let message: Omit<MessageType, "id"> = {
            conversationId,
            contentType: data.base64Buffer === null ? 'text' : bufferType!,
            content: captionText ?? String(data.text),
            private: false,
            messageType: "outgoing",
            whatsappId: data.messageID,
            buffer: buffer,
        }
        const result = await saveNewMessageInConversation(conversationId, message)
        return JSON.stringify(result)

    }
}
