import { RequestHandler, Router } from "express"
import { deleteAgent, getAgentById, getAgentTeams, getAgents, saveNewAgent, updateAgent, updateAgentTeams } from "../../service/agentService"

const getUserHandler: RequestHandler = async (req, res, next) => {
    try {
        const agent = await getAgentById(Number(req.params.id))
        req.agent = agent
    } catch (e: any) {
        return res.status(404).json({ error: e.message })
    }
    next()
}

const agentRouter = Router()

agentRouter.route("/")
    .get(async (req, res) => {
        const agents = await getAgents()
        res.json({ agents })
    })
    .post(async (req, res) => {
        const agent = await saveNewAgent(req.body)
        res.json({ agent })
    })

agentRouter.use("/:id", getUserHandler)
agentRouter.use("/:id/teams", getUserHandler)

agentRouter.route("/:id")
    .get(async (req, res) => {
        res.json({ agent: req.agent })
    })
    .put(async (req, res) => {
        try {
            const agent = await updateAgent(req.agent, req.body)
            res.json({ agent })
        } catch (e: any) {
            return res.status(500).json({ error: e.message })
        }
    })
    .delete(async (req, res) => {
        try {
            const agent = await deleteAgent(req.agent)
            res.json({ agent })
        } catch (e: any) {
            return res.status(500).json({ error: e.message })
        }
    })

agentRouter.route("/:id/teams")
    .get(async (req, res) => {
        try {
            res.json({ teams: await getAgentTeams(req.agent) })
        } catch (e: any) {
            return res.status(404).json({ error: e.message })
        }
    })
    .put(async (req, res) => {
        try {
            const teams = await updateAgentTeams(req.agent, req.body)
            res.json({ teams })
        } catch (e: any) {
            return res.status(500).json({ error: e.message })
        }
    })

export default agentRouter
