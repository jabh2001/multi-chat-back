import { Router } from "express"
import { deleteAgent, getAgentById, getTeams, saveNewAgent, updateAgent } from "../../service/agentService"
const agentRouter = Router()

agentRouter.route("/")
    .get(async(req, res) => {
        const agents = await getTeams()
        res.json({ agents })
    })
    .post(async (req, res) => {
        const agent = await saveNewAgent(req.body)
        res.json({ agent })
    })
    
agentRouter.route("/:id")
    .get(async (req, res) => {
        const agent = await getAgentById(Number(req.params.id))
        res.json({ agent })
    })
    .put(async (req, res) => {
        const agent = await updateAgent(Number(req.params.id), req.body)
        res.json({ agent })
    })
    .delete(async (req, res) => {
        const agent = await deleteAgent(Number(req.params.id))
        res.json({ agent })
    })

export default agentRouter
