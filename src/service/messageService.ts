import { MessageModel } from "../libs/models";
import { messageSchema } from "../libs/schemas";
import { MessageType } from "../types";

export async function getMessageByConversation(conversationId:any){
    return await MessageModel.query.filter(MessageModel.c.conversationId.equalTo(conversationId)).fetchAllQuery<MessageType>()
}
export async function saveNewMessageInConversation(conversationId:any, message:MessageType){
    const newData = messageSchema.omit({ id:true, conversationId:true })
    return await MessageModel.insert.value({ ...newData, conversationId }).filter(MessageModel.c.conversationId.equalTo(conversationId)).fetchOneQuery<MessageType>()
}