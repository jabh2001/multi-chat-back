import { Router } from "express"
import { getConversations } from "../../service/conversationService"
import { getContactAvatarUrl } from "../../service/contactService"

const conversationRouter = Router()

conversationRouter.get("/", async (req, res) => {
        try{
            const conversations = await getConversations(req.query)
            res.json({ conversations:conversations.map((c:any) => {
                const { conversation, contact, ...rest } = c
                return { ...conversation, contact:{
                    ...contact,
                    avatarUrl:getContactAvatarUrl(req, contact.id)
                }, ...rest }
            }) })
        } catch (e:any){
            return res.status(500).json({ error: e.message })
        }
    })

export default conversationRouter
