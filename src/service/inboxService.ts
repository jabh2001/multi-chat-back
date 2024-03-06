import { InboxModel } from "../libs/models";
import { InboxType } from "../types";

export async function getInboxes(){
    return await InboxModel.query.fetchAllQuery() as InboxType[]
}

export async function saveNewInbox(inbox:Omit<InboxType, "id">){
    return await InboxModel.insert.value(inbox).fetchOneQuery() as InboxType
}

export async function getInboxById(inboxId:InboxType["id"]){
    return await InboxModel.query.filter(InboxModel.c.id.equalTo(inboxId)).fetchOneQuery() as InboxType
}

export async function updateInbox(inbox:InboxType, newData:Partial<InboxType>){
    return await InboxModel.update.values(newData).filter(InboxModel.c.id.equalTo(inbox.id)).fetchOneQuery() as InboxType
}