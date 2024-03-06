import { NextFunction, Request, Response, Router } from "express"
import teamRouter from "./teamRouter"
import labelRouter from "./labelRouter"
import agentRouter from "./agentRouter"
import contactRouter from "./contactRouter"
import testRouter from "./test"
import { AgentType, ContactType, ConversationType, InboxType } from "../../types"
import inboxRouter from "./inboxRouter"

const apiRouter = Router()
apiRouter.use("/team", teamRouter)
apiRouter.use("/teams", teamRouter)

apiRouter.use("/label", labelRouter)
apiRouter.use("/labels", labelRouter)

apiRouter.use("/agent", agentRouter)
apiRouter.use("/agents", agentRouter)

apiRouter.use("/contact", contactRouter)
apiRouter.use("/contacts", contactRouter)
apiRouter.use("/test", testRouter)

apiRouter.use("/inbox", inboxRouter)
apiRouter.use("/inboxes", inboxRouter)

apiRouter.use((err:any, req:Request, res:Response, next:NextFunction)=>{
  res.status(500).send('Something broke!');
})
export default apiRouter

declare global {
    namespace Express {
      interface Request {
        contact: ContactType
        agent:AgentType
        inbox:Inbox
      }
    }
}

interface Inbox extends InboxType {
  conversation?:ConversationType
}
