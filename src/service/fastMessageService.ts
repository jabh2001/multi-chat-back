import { getClientList } from "../app";
import { FastMediaMessageModel, FastMessageModel } from "../libs/models"
import { FastMediaMessageType, FastMessageType, fastMediaMessageSchema, fastMessageSchema } from "../libs/schemas"

const sseClients = getClientList()
interface Data {
    fastMessage: FastMessageType;
    newFastMediaMessage?: FastMediaMessageType[];
}
/*  FAST MESSAGE  */
export const getFastMessages = async () => {
    const messages =  await FastMessageModel.query.fetchAllQuery<FastMessageType>()
    for(let i=0; i<messages.length; i++){
        messages[i].fastMediaMessages = await getFastMediaMessagesByFastMessageId(messages[i].id)
    }
    return messages
}

export const saveNewFastMessage = async (newFastMessage:FastMessageType,{ fastMediaMessage}:{fastMediaMessage?:FastMediaMessageType[]}={}) => {
    const newData = fastMessageSchema.omit({ id:true }).parse(newFastMessage)

    const fastMessage = await FastMessageModel.insert.value(newData).fetchOneQuery<FastMessageType>()
    let data:Data = { fastMessage, newFastMediaMessage:[] }
    if(fastMediaMessage && fastMediaMessage.length>0){
        let order = 1
        for (const media of fastMediaMessage) {
            data.newFastMediaMessage!.push(await saveNewFastMediaMessage({...media, fastMessageId:fastMessage.id, order}))
            order++
        }
    }
    sseClients.emitToClients("insert-fast-message", {...fastMessage, fastMediaMessages:data.newFastMediaMessage })
    
    return data
}
export const getFastMessageById = async (id:FastMessageType["id"]) => {
    const fastMessage =  (
        await FastMessageModel.query
        .filter(FastMessageModel.c.id.equalTo(id))
        .join(FastMediaMessageModel, FastMediaMessageModel.c.fastMessageId, FastMessageModel.c.id)
        .fetchOneQuery<FastMessageType>()
    )
    fastMessage.fastMediaMessages = await getFastMediaMessagesByFastMessageId(id)
    return fastMessage
}
export const updateFastMessage = async (id:FastMessageType["id"], newFastMessage:Partial<FastMessageType>, {fastMediaMessage}:{fastMediaMessage?:FastMediaMessageType[]}={}) => {
    const newData = fastMessageSchema.omit({ id:true }).partial().parse(newFastMessage)

    const fastMessage = await FastMessageModel.update.values(newData).filter(FastMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMessageType>()
    let data:Data = { fastMessage, newFastMediaMessage:[] }
    
    if(fastMediaMessage && fastMediaMessage?.length>0){
        await FastMediaMessageModel.delete.filter(FastMediaMessageModel.c.fastMessageId.equalTo(fastMessage.id)).fetchAllQuery()
        let order = 1
        for (const media of fastMediaMessage) {
            data.newFastMediaMessage!.push(await saveNewFastMediaMessage({...media, fastMessageId:fastMessage.id, order}))
            order++
        }
    }
    sseClients.emitToClients("update-fast-message", {...fastMessage, fastMediaMessages:data.newFastMediaMessage } as any)
    return data
}

export const deleteFastMessage = async (id:FastMessageType["id"]) => {
    const fastMessage = await FastMessageModel.delete.filter(FastMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMessageType>()
    sseClients.emitToClients('delete-fast-message', [id])
    return fastMessage
}

/*  FAST MEDIA MESSAGE  */

export const getFastMediaMessages = async () => {
    return await FastMediaMessageModel.query.fetchAllQuery<FastMediaMessageType>()
}

export const getFastMediaMessagesByFastMessageId = async (id:FastMessageType["id"]) => {
    return await FastMediaMessageModel.query.filter(FastMediaMessageModel.c.fastMessageId.equalTo(id)).fetchAllQuery<FastMediaMessageType>()
}

export const saveNewFastMediaMessage = async (newFastMediaMessage:Omit<FastMediaMessageType, "id">) => {
    const newData = fastMediaMessageSchema.omit({ id:true }).parse(newFastMediaMessage)
    const fastMediaMessage = await FastMediaMessageModel.insert.value(newData).fetchOneQuery<FastMediaMessageType>()
    sseClients.emitToClients("insert-fast-media-message", fastMediaMessage)
    return fastMediaMessage
}
export const getFastMediaMessageById = async (id:FastMediaMessageType["id"]) => {
    return await FastMediaMessageModel.query.filter(FastMediaMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMediaMessageType>()
}
export const updateFastMediaMessage = async (id:FastMediaMessageType["id"], newFastMediaMessage:Partial<FastMediaMessageType>) => {
    const newData = fastMediaMessageSchema.omit({ id:true }).partial().parse(newFastMediaMessage)
    const fastMediaMessage = await FastMediaMessageModel.update.values(newData).filter(FastMediaMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMediaMessageType>()
    sseClients.emitToClients("update-fast-media-message", fastMediaMessage)
    return fastMediaMessage
}
export const deleteFastMediaMessage = async (id:FastMediaMessageType["id"]) => {
    const fastMediaMessage = await FastMediaMessageModel.delete.filter(FastMediaMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMediaMessageType>()
    sseClients.emitToClients('delete-fast-media-message', [id])
    return fastMediaMessage
}
