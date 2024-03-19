import { getClientList } from "../app";
import { ContactModel, ConversationModel, InboxModel } from "../libs/models";
import { Join } from "../libs/orm/query";
import { ConversationType } from "../types";

const sseClients = getClientList()

export async function getConversations(){
    return await ConversationModel.query.join(ConversationModel.r.inbox, Join.INNER).join(ConversationModel.r.sender, Join.INNER).fetchAllQuery()
}
export async function getInboxConversations(inboxId:any){
    return ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId)).fetchAllQuery<ConversationType>()
}

export async function saveNewConversation(conversation:Omit<ConversationType, "id">){
    const newConversation = await ConversationModel.insert.value({...conversation }).fetchOneQuery<ConversationType>();
    sseClients.emitToClients("insert-conversation", newConversation)
    return newConversation
}

export async function getInboxConversationById(inboxId:any, conversationId:any){
    return await ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId), ConversationModel.c.id.equalTo(conversationId)).fetchOneQuery<ConversationType>()
}

export async function getInboxConversationAndContactById(inboxId:any, conversationId:any){
    const query = ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId), ConversationModel.c.id.equalTo(conversationId)).join(ConversationModel.r.sender, Join.INNER)

    return await query.fetchOneQuery<ConversationType>()
}

export async function updateInboxConversation(conversationId:any, newData:any){
    return await ConversationModel.update.values(newData).filter(ConversationModel.c.id.equalTo(conversationId)).fetchOneQuery<ConversationType>()
}