import { Router } from "express"
import teamRouter from "./teamRouter"
import labelRouter from "./labelRouter"
import agentRouter from "./agentRouter"
import contactRouter from "./contactRouter"
import testRouter from "./test"
import { AgentType, ContactType } from "../../types"

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

export default apiRouter

declare global {
    namespace Express {
      interface Request {
        contact: ContactType
        agent:AgentType
      }
    }
}

