import { FastMediaMessageModel, FastMessageModel } from "../libs/models"
import { FastMediaMessageType, FastMessageType, fastMediaMessageSchema, fastMessageSchema } from "../libs/schemas"

/*  FAST MESSAGE  */
export const getFastMessages = async () => {
    return await FastMessageModel.query.fetchAllQuery<FastMessageType>()
}

export const saveNewFastMessage = async (newFastMessage:FastMessageType,{ fastMedia}:{fastMedia?:FastMediaMessageType[]}={}) => {
    interface Data {
        fastMessage: FastMessageType;
        newFastMediaMessagge?: FastMediaMessageType[];
    }
    const newData = fastMessageSchema.omit({ id:true }).parse(newFastMessage)

    const fastMessage = await FastMessageModel.insert.value(newData).fetchOneQuery<FastMessageType>()
    let data:Data = {fastMessage,newFastMediaMessagge:[]}
    if(fastMedia && fastMedia.length>0){
        for (const media of fastMedia) {
            media.fastMessageId = fastMessage.id;
            const mediaData = fastMediaMessageSchema.omit({ id: true }).parse(media);
            const newFastMediaMessagge = await FastMediaMessageModel.insert.value(mediaData).fetchOneQuery<FastMediaMessageType>();
            data.newFastMediaMessagge!.push(newFastMediaMessagge)
        }
    }
    
    return data
}
export const getFastMessageById = async (id:FastMessageType["id"]) => {
    return (
        await FastMessageModel.query
        .filter(FastMessageModel.c.id.equalTo(id))
        .join(FastMediaMessageModel, FastMediaMessageModel.c.fastMessageId, FastMessageModel.c.id)
        .fetchOneQuery<FastMessageType>()
    )
}
export const updateFastMessage = async (id:FastMessageType["id"], newFastMessage:Partial<FastMessageType>, {fastMediaMessage}:{fastMediaMessage?:FastMediaMessageType[]}={}) => {
    interface Data {
        fastMessage: FastMessageType;
        newFastMediaMessagge?: FastMediaMessageType[];
    }
    const newData = fastMessageSchema.omit({ id:true }).parse(newFastMessage)

    const fastMessage = await FastMessageModel.update.values(newData).filter(FastMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMessageType>()
    let data:Data = {fastMessage,newFastMediaMessagge:[]}
    
    if(fastMediaMessage && fastMediaMessage?.length>0){
        for(const media of fastMediaMessage){
            const mediaData = fastMediaMessageSchema.omit({id:true}).parse(media)
            const updatedMedia = await FastMediaMessageModel.update.values(mediaData).filter(FastMediaMessageModel.c.id.equalTo(media.id)).fetchOneQuery<FastMediaMessageType>()
            data.newFastMediaMessagge?.push(updatedMedia)
        }
    }
    return data
}

export const deleteFastMessage = async (id:FastMessageType["id"]) => {
    const fastMessage = await FastMessageModel.delete.filter(FastMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMessageType>()
    // sseClients.emitToClients('delete-fastMessage', [id])
    return fastMessage
}

/*  FAST MEDIA MESSAGE  */

export const getFastMediaMessages = async () => {
    return await FastMediaMessageModel.query.fetchAllQuery<FastMediaMessageType>()
}

export const saveNewFastMediaMessage = async (newFastMediaMessage:FastMediaMessageType) => {
    const newData = fastMediaMessageSchema.omit({ id:true }).parse(newFastMediaMessage)
    const fastMediaMessage = await FastMediaMessageModel.insert.value(newData).fetchOneQuery<FastMediaMessageType>()
    // sseClients.emitToClients("insert-fastMediaMessage", fastMediaMessage)
    return fastMediaMessage
}
export const getFastMediaMessageById = async (id:FastMediaMessageType["id"]) => {
    return await FastMediaMessageModel.query.filter(FastMediaMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMediaMessageType>()
}
export const updateFastMediaMessage = async (id:FastMediaMessageType["id"], newFastMediaMessage:Partial<FastMediaMessageType>) => {
    const newData = fastMediaMessageSchema.omit({ id:true }).parse(newFastMediaMessage)
    const fastMediaMessage = await FastMediaMessageModel.update.values(newData).filter(FastMediaMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMediaMessageType>()
    // sseClients.emitToClients("update-fastMediaMessage", fastMediaMessage)
    return fastMediaMessage
}
export const deleteFastMediaMessage = async (id:FastMediaMessageType["id"]) => {
    const fastMediaMessage = await FastMediaMessageModel.delete.filter(FastMediaMessageModel.c.id.equalTo(id)).fetchOneQuery<FastMediaMessageType>()
    // sseClients.emitToClients('delete-fastMediaMessage', [id])
    return fastMediaMessage
}