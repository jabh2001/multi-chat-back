import { Handler, Router } from "express";
import { deleteInbox, getInboxById, getInboxes, saveNewInbox, updateInbox } from "../../../service/inboxService";
import { getInboxConversationAndContactById, getInboxConversations, saveNewConversation, updateInboxConversation } from "../../../service/conversationService";
import { getMessageByConversation, saveNewMessageInConversation } from "../../../service/messageService";
import { errorResponse } from "../../../service/errorService";
import SocketPool from "../../../libs/socketConnectionPool";
import client from "../../../libs/dataBase";
import { ContactModel, ConversationModel } from "../../../libs/models";

const inboxRouter = Router()

const getInboxMiddleware: Handler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) throw new Error("Invalid id")
        req.inbox = await getInboxById(id) as any
        next()
    } catch (e: any) {
        return errorResponse(res, e)
    }
}
const getConversationMiddleware: Handler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.conversationId)
        if (isNaN(id)) throw new Error("Invalid id")
        req.inbox.conversation = await getInboxConversationAndContactById(req.params.id, id)
        next()
    } catch (e: any) {
        return errorResponse(res, e)
    }
}
inboxRouter.route("/")
    .get(async (_req, res) => {
        try {
            res.json({ inboxes: await getInboxes() })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            console.log(req.body)
            res.json({ inbox: await saveNewInbox(req.body) })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

inboxRouter.route("/:id").all(getInboxMiddleware)
    .get(async (req, res) => {
        try {
            res.json({ inbox: req.inbox })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            const id = parseInt(req.params.id)
            if (isNaN(id)) throw new Error("Invalid id")
            res.json({ inbox: await updateInbox(req.inbox, req.body) })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .delete(async (req, res) =>{
        try {
            const inbox = deleteInbox(req.inbox.id)
            res.json({ inbox })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
inboxRouter.route('/:id/log-out').all(getInboxMiddleware)
    .post(async (req, res)=>{
        const inbox = req.inbox
        const conn = SocketPool.getInstance().getBaileysConnection(inbox.name)
        if(conn){
            await conn.logout()
        }
        res.json({ inbox })
    })
inboxRouter.route("/:id/conversation").all(getInboxMiddleware)
    .get(async (req, res) => {
        try {
            res.json({ conversations: await getInboxConversations(req.params.id) })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            const senderId = req.body.senderId
            const inboxId = req.body.inboxId
            const result =  await ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(inboxId), ConversationModel.c.senderId.equalTo(senderId)).fetchAllQuery()
            if(result.length >0){
                res.json({"mensaje":"ya existe una conversacion"})
            }else{
                const newConversation =await saveNewConversation({ ...req.body, inboxId: req.params.id })
                
                res.json({ conversation:  newConversation})
            }
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

inboxRouter.route("/:id/conversation/:conversationId").all(getInboxMiddleware, getConversationMiddleware)
    .get(async (req, res) => {
        try {
            res.json({ conversation: req.inbox.conversation })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            res.json({ conversation: await updateInboxConversation(req.inbox.conversation?.id, { ...req.body }) })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
inboxRouter.route("/:id/conversation/:conversationId/message").all(getInboxMiddleware, getConversationMiddleware)
    .get(async (req, res) => {
        try {
            res.json({ messages: await getMessageByConversation(req.params.conversationId) })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            // const message = await saveNewMessageInConversation(req.params.conversationId, { ...req.body }) 
            // if(!message){
            //     res.json({})
            // }
            res.json({ })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
inboxRouter.put("/:id/conversation/:conversationId/send-message", getInboxMiddleware, getConversationMiddleware, async (req, res) => {
    try {
        const connection = SocketPool.getInstance().getBaileysConnection(req.inbox.name)
        connection?.sendMessage(req.inbox.conversation.contact.phoneNumber, { content: req.body.message } as any)
    } catch (e: any) {
        return errorResponse(res, e)
    }
})


export default inboxRouter