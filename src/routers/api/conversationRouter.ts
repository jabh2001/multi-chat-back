import { Router } from "express"
import { getConversations } from "../../service/conversationService"

const conversationRouter = Router()

conversationRouter.get("/", async (req, res) => {
        try{
            const conversations = await getConversations()
            res.json({ conversations })
        } catch (e:any){
            return res.status(500).json({ error: e.message })
        }
    })

export default conversationRouter
