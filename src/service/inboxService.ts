import { InboxModel } from "../libs/models";
import { inboxSchema } from "../libs/schemas";
import SocketPool from "../libs/socketConnectionPool";
import { InboxType } from "../types";

export async function getInboxes(){
    const inboxes = await InboxModel.query.fetchAllQuery() as InboxType[]
    return inboxes.map(inbox => {
        const conn = SocketPool.getInstance().getOrCreateBaileysConnection(inbox.name)
        const user = conn.sock.user
        const qr = conn.getQRBase64()
        return { ...inbox, user, qr }
    })
}

export async function saveNewInbox(inbox:Omit<InboxType, "id">){
    const newData = inboxSchema.omit({ id:true }).parse(inbox)
    const newInbox = await InboxModel.insert.value(newData).fetchOneQuery() as InboxType
    const pool = SocketPool.getInstance()
    pool.createBaileysConnection(newInbox.name) //
    return newInbox
}

export async function getInboxById(inboxId:InboxType["id"]){
    return await InboxModel.query.filter(InboxModel.c.id.equalTo(inboxId)).fetchOneQuery() as InboxType
}

export async function updateInbox(inbox:InboxType, newData:Partial<InboxType>){
    const newDataA = inboxSchema.omit({ id:true }).parse(newData)
    return await InboxModel.update.values(newDataA).filter(InboxModel.c.id.equalTo(inbox.id)).fetchOneQuery() as InboxType
}