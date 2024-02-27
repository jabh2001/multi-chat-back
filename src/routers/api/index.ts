import { Router } from "express"
import teamRouter from "./teamRouter"
import labelRouter from "./labelRouter"
import agentRouter from "./agentRouter"

const apiRouter = Router()

apiRouter.use("/team", teamRouter)
apiRouter.use("/teams", teamRouter)

apiRouter.use("/label", labelRouter)
apiRouter.use("/labels", labelRouter)

apiRouter.use("/agent", agentRouter)
apiRouter.use("/agents", agentRouter)

export default apiRouter