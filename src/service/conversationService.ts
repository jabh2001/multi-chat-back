import { getClientList } from "../app";
import { ContactLabelModel, ContactModel, ConversationModel, InboxModel, MessageModel } from "../libs/models";
import { Join, RawSQL } from "../libs/orm/query";
import { type ConversationSchemaType, conversationSchema } from "../libs/schemas";
import { ConversationType } from "../types";

const sseClients = getClientList()

export async function getConversations({ inbox, label}:{ inbox?:string, label?:string}={}){
    const lastMessage = (
        MessageModel.query.select(MessageModel.c.content)
        .filter(MessageModel.c.conversationId.equalTo(ConversationModel.c.id))
        .order(MessageModel.c.createdAt.desc())
        .limit(1)
        .subquery("lastMessage")
    )
    const lastMessageDate = (
        MessageModel.query.select(MessageModel.c.createdAt)
        .filter(MessageModel.c.conversationId.equalTo(ConversationModel.c.id))
        .order(MessageModel.c.createdAt.desc())
        .limit(1)
        .subquery("lastMessageDate")
    )
    const messageCount = new RawSQL(`(SELECT count(*) FROM ${MessageModel.q} WHERE ${MessageModel.c.conversationId.q} =${ConversationModel.c.id.q} AND ${MessageModel.c.status.q} = false)`).label("messageCount")
    let query = (
        ConversationModel.query.
        select(ConversationModel, InboxModel, ContactModel, lastMessage, lastMessageDate, messageCount)
        .join(ConversationModel.r.inbox, Join.INNER)
        .join(ConversationModel.r.sender, Join.INNER)
    )
    if(label){
        query = query.join(ContactLabelModel, ContactLabelModel.c.contactId, ConversationModel.c.senderId).filter(ContactLabelModel.c.labelId.equalTo(label))
    } else if(inbox){
        query = query.filter(InboxModel.c.id.equalTo(inbox))
    }
    return await query.fetchAllQuery()
}
export async function getInboxConversations(inboxId:any){
    const lastMessage = (
        MessageModel.query.select(MessageModel.c.content)
        .filter(MessageModel.c.conversationId.equalTo(ConversationModel.c.id))
        .order(MessageModel.c.createdAt.desc())
        .limit(1)
        .subquery("lastMessage")
    )
    const messageCount1 = (
        MessageModel.query.select(new RawSQL("count(*)").label("messageCount"))
        .filter(MessageModel.c.conversationId.equalTo(ConversationModel.c.id))
        .order()
        .subquery("messageCount")
    )
    const messageCount = new RawSQL(`(SELECT count(*) FROM ${MessageModel.q} WHERE ${MessageModel.c.conversationId.q} =${ConversationModel.c.id.q} AND ${MessageModel.c.status.q} = false)`).label("messageCount")
    return await ConversationModel.query.select(...Object.values(ConversationModel.c), lastMessage, messageCount).filter(ConversationModel.c.inboxId.equalTo(inboxId)).fetchAllQuery<ConversationType>()
}

export async function saveNewConversation(conversation:Omit<ConversationSchemaType, "id">){
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
export async function getAsignedUserByIdSchema(inboxId:any, contactId:any){
    const query = ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId), ContactModel.c.id.equalTo(contactId)).join(ConversationModel.r.sender, Join.INNER)

    return await query.fetchOneQuery<ConversationSchemaType>()
}

export async function updateInboxConversation(conversationId:any, newData:any){
    return await ConversationModel.update.values(newData).filter(ConversationModel.c.id.equalTo(conversationId)).fetchOneQuery<ConversationType>()
}

export async function getOrCreateConversation(inboxId:any, senderId:any){
    const conversations = await ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId), ConversationModel.c.senderId.equalTo(senderId)).fetchAllQuery<ConversationType>()
    if( conversations.length > 0){
        return conversations[0]
    }
    return await saveNewConversation({ inboxId, senderId })
}