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
    
agentRouter.use("/:id", async (req, res, next)=>{
    try {

        const agent = await getAgentById(Number(req.params.id))
        req.agent = agent
    } catch(e) {
        return res.status(404).json({ error : 'Contact not found'})
    }
    next()
})
agentRouter.route("/:id")
    .get(async (req, res) => {
        const agent = await getAgentById(Number(req.params.id))
        res.json({ agent })
    })
    .put(async (req, res) => {
        const agent = await updateAgent(req.agent, req.body)
        res.json({ agent })
    })
    .delete(async (req, res) => {
        const agent = await deleteAgent(req.agent)
        res.json({ agent })
    })

export default agentRouter
