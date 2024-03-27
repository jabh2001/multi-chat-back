import { getClientList } from "../app";
import { MessageModel } from "../libs/models";
import { messageSchema } from "../libs/schemas";
import { MessageType } from "../types";
const sseClients = getClientList()

export async function getMessageByConversation(conversationId:any){
    return await MessageModel.query.filter(MessageModel.c.conversationId.equalTo(conversationId)).fetchAllQuery<MessageType>()
}
export async function saveNewMessageInConversation(conversationId:any, message:any){
    
    const newData = messageSchema.omit({ id:true, conversationId:true }).parse(message)
    const newMessage =  await MessageModel.insert.value({ ...newData, conversationId }).fetchOneQuery<MessageType>()
    sseClients.emitToClients("update-conversation-last-message", {conversationId, lastMessage:newMessage.content, lastMessageDate:String(newMessage.createdAt)})
    return newMessage
}

export async function getMessageByWhatsAppId(whatsAppId:string) {
    return await MessageModel.query.filter(MessageModel.c.whatsappId.equalTo(whatsAppId)).fetchAllQuery()
}