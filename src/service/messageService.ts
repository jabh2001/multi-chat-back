import { MessageModel } from "../libs/models";
import { MessageType } from "../types";

export async function getMessageByConversation(conversationId:any){
    return await MessageModel.query.filter(MessageModel.c.conversationId.equalTo(conversationId)).fetchAllQuery<MessageType>()
}
export async function saveNewMessageInConversation(conversationId:any, message:MessageType){
    // return MessageModel.insert.value({ ...message, conversationId }).filter(MessageModel.c.conversationId.equalTo(conversationId)).getSQL()
    return await MessageModel.insert.value({ ...message, conversationId }).filter(MessageModel.c.conversationId.equalTo(conversationId)).fetchOneQuery<MessageType>()
}