import { InboxModel } from "../libs/models";
import { inboxSchema } from "../libs/schemas";
import { InboxType } from "../types";

export async function getInboxes(){
    return await InboxModel.query.fetchAllQuery() as InboxType[]
}

export async function saveNewInbox(inbox:Omit<InboxType, "id">){
    const newData = inboxSchema.omit({ id:true }).parse(inbox)
    return await InboxModel.insert.value(newData).fetchOneQuery() as InboxType
}

export async function getInboxById(inboxId:InboxType["id"]){
    return await InboxModel.query.filter(InboxModel.c.id.equalTo(inboxId)).fetchOneQuery() as InboxType
}

export async function updateInbox(inbox:InboxType, newData:Partial<InboxType>){
    const newDataA = inboxSchema.omit({ id:true }).parse(newData)
    return await InboxModel.update.values(newDataA).filter(InboxModel.c.id.equalTo(inbox.id)).fetchOneQuery() as InboxType
}