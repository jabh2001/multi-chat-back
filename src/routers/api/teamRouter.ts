import { Router } from "express"
import { deleteTeam, getTeamById, getTeams, saveNewTeam, updateTeam } from "../../service/teamService"
const teamRouter = Router()

teamRouter.route("/")
    .get(async(req, res) => {
        const teams = await getTeams()
        res.json({ teams })
    })
    .post(async (req, res) => {
        const team = await saveNewTeam(req.body)
        res.json({ team })
    })
    
teamRouter.route("/:id")
    .get(async (req, res) => {
        const team = await getTeamById(Number(req.params.id))
        res.json({ team })
    })
    .put(async (req, res) => {
        const team = await updateTeam(Number(req.params.id), req.body)
        res.json({ team })
    })
    .delete(async (req, res) => {
        const team = await deleteTeam(Number(req.params.id))
        res.json({ team })
    })

export default teamRouter