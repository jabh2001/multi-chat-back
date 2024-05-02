import { getClientList } from "../app";
import { ConversationNoteModel, UserModel } from "../libs/models";
import { ConversationNoteType, conversationNoteSchema } from "../libs/schemas";
import bcrypt from "bcrypt"
import { ConversationType } from "../types";
const sseClients = getClientList()
const salt = 10

export const getConversationNotes = async (conversationId:ConversationType["id"]) => {
    return (
        await ConversationNoteModel.query
        .join(UserModel, UserModel.c.id, ConversationNoteModel.c.userId)
        .filter(ConversationNoteModel.c.conversationId.equalTo(conversationId))
        .fetchAllQuery()
    )
}

export const saveNewConversationNote = async (newConversationNote:ConversationNoteType) => {
    const newData = conversationNoteSchema.omit({ id:true }).parse(newConversationNote)
    const conversationNote = await ConversationNoteModel.insert.value(newData).fetchOneQuery<ConversationNoteType>()
    // sseClients.emitToClients("insert-conversationNote", conversationNote)
    return conversationNote
}
export const getConversationNoteById = async (id:ConversationNoteType["id"]) => {
    return await ConversationNoteModel.query.filter(ConversationNoteModel.c.id.equalTo(id)).fetchOneQuery()
}

export const updateConversationNote = async (conversationNote:ConversationNoteType, newConversationNote:Partial<ConversationNoteType>) => {
    const newData = conversationNoteSchema.omit({ id:true }).partial().parse(newConversationNote)
    const updateConversationNote = await ConversationNoteModel.update.values(newData).filter(ConversationNoteModel.c.id.equalTo(conversationNote.id)).fetchOneQuery()
    // sseClients.emitToClients("update-conversationNote", parserConversationNote)
    return updateConversationNote as any

}

export const deleteConversationNote = async (conversationNote:ConversationNoteType) => {
    const deleted =  await ConversationNoteModel.delete.filter(ConversationNoteModel.c.id.equalTo(conversationNote.id)).fetchOneQuery<ConversationNoteType>()
    // sseClients.emitToClients("delete-conversationNote", [deleted.id])
    return deleted
}
