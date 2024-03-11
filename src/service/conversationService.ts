import { ContactModel, ConversationModel, InboxModel } from "../libs/models";
import { ConversationType } from "../types";

export async function getConversations(){
    return await ConversationModel.query.join(InboxModel).join(ContactModel).fetchAllQuery()
}
export async function getInboxConversations(inboxId:any){
    return ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId)).fetchAllQuery<ConversationType>()
}

export async function saveNewConversation(conversation:Omit<ConversationType, "id">){
    const newConversation = await ConversationModel.insert.value({...conversation }).fetchOneQuery();
    return newConversation
}

export async function getInboxConversationById(inboxId:any, conversationId:any){
    return await ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId), ConversationModel.c.id.equalTo(conversationId)).fetchOneQuery<ConversationType>()
}

export async function getInboxConversationAndContactById(inboxId:any, conversationId:any){
    return await ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId), ConversationModel.c.id.equalTo(conversationId)).join(ContactModel).fetchOneQuery<ConversationType>()
}

export async function updateInboxConversation(conversationId:any, newData:any){
    return await ConversationModel.update.values(newData).filter(ConversationModel.c.id.equalTo(conversationId)).fetchOneQuery<ConversationType>()
}