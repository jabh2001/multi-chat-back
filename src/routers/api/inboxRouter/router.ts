import { Handler, Router } from "express";
import { getInboxById, getInboxes, saveNewInbox, updateInbox } from "../../../service/inboxService";
import { getInboxConversationById, getInboxConversations, saveNewConversation, updateInboxConversation } from "../../../service/conversationService";
import { getMessageByConversation, saveNewMessageInConversation } from "../../../service/messageService";

const inboxRouter = Router()

const getInboxMiddleware: Handler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) throw new Error("Invalid id")
        req.inbox = await getInboxById(id)
        next()
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
}
const getConversationMiddleware: Handler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.conversationId)
        if (isNaN(id)) throw new Error("Invalid id")
        req.inbox.conversation = await getInboxConversationById(req.params.id, id)
        next()
    } catch (e: any) {
        return res.status(400).json({ error: e.message });
    }
}
inboxRouter.route("/")
    .get(async (_req, res) => {
        res.json({ inboxes: await getInboxes() })
    })
    .post(async (req, res) => {
        try {
            res.json({ inbox: await saveNewInbox(req.body) })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })

inboxRouter.route("/:id").all(getInboxMiddleware)
    .get(async (req, res) => {
        res.json({ inbox: req.inbox })
    })
    .put(async (req, res) => {
        try {
            const id = parseInt(req.params.id)
            if (isNaN(id)) throw new Error("Invalid id")
            res.json({ inbox: await updateInbox(req.inbox, req.body) })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })

inboxRouter.route("/:id/conversation").all(getInboxMiddleware)
    .get(async (req, res) => {
        try {
            res.json({ conversations: await getInboxConversations(req.params.id) })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })
    .post(async (req, res) => {
        try {
            res.json({ conversation: await saveNewConversation({ ...req.body, inboxId: req.params.id }) })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })

inboxRouter.route("/:id/conversation/:conversationId").all(getInboxMiddleware, getConversationMiddleware)
    .get(async (req, res) => {
        try {
            res.json({ conversation: req.inbox.conversation })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })
    .put(async (req, res) => {
        try {
            res.json({ conversation: await updateInboxConversation(req.inbox.conversation?.id, { ...req.body }) })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })
inboxRouter.route("/:id/conversation/:conversationId/message").all(getInboxMiddleware, getConversationMiddleware)
    .get(async (req, res) => {
        try {
            res.json({ messages: await getMessageByConversation(req.params.conversationId) })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })
    .post(async (req, res) => {
        try {
            res.json({ message: await saveNewMessageInConversation(req.params.conversationId, { ...req.body }) })
        } catch (e: any) {
            return res.status(400).json({ error: e.message });
        }
    })

export default inboxRouter