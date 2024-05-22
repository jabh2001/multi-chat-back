import { Router } from "express"
import teamRouter from "./teamRouter"
import labelRouter from "./labelRouter"
import agentRouter from "./agentRouter"
import contactRouter from "./contactRouter"
import { AgentType, ContactType, ConversationType, InboxType } from "../../types"
import inboxRouter from "./inboxRouter"
import authRouter from "./authRouter"
import { UserType } from "../../libs/schemas"
import { isAuthenticatedMiddleware } from "../../service/authService"
import conversationRouter from "./conversationRouter"
import fastRouter from "./fastMessageRouter"


const authenticatedRoute = Router()

authenticatedRoute.use(isAuthenticatedMiddleware)
authenticatedRoute.use("/team", teamRouter)
authenticatedRoute.use("/teams", teamRouter)

authenticatedRoute.use("/label", labelRouter)
authenticatedRoute.use("/labels", labelRouter)

authenticatedRoute.use("/agent", agentRouter)
authenticatedRoute.use("/agents", agentRouter)

authenticatedRoute.use("/contact", contactRouter)
authenticatedRoute.use("/contacts", contactRouter)

authenticatedRoute.use("/inbox", inboxRouter)
authenticatedRoute.use("/inboxes", inboxRouter)

authenticatedRoute.use("/conversation", conversationRouter)
authenticatedRoute.use("/conversations", conversationRouter)

authenticatedRoute.use("/fast-message", fastRouter)


const apiRouter = Router()
apiRouter.use(authRouter)
apiRouter.use(authenticatedRoute)
export default apiRouter

declare global {
    namespace Express {
      interface Request {
        identity:Omit<UserType, "password">
        contact: ContactType
        agent:AgentType
        inbox:Inbox
      }
    }
}

interface Inbox extends InboxType {
  conversation:Conversation
}

interface Conversation extends ConversationType {
  contact:ContactType
}