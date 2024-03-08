import { Router } from "express"
import { deleteTeam, getTeamById, getTeams, saveNewTeam, updateTeam } from "../../service/teamService"
import { errorResponse } from "../../service/errorService"
const teamRouter = Router()

teamRouter.route("/")
    .get(async (req, res) => {
        try {
            const teams = await getTeams()
            res.json({ teams })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            const team = await saveNewTeam(req.body)
            res.json({ team })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

teamRouter.route("/:id")
    .get(async (req, res) => {
        try {
            const team = await getTeamById(Number(req.params.id))
            res.json({ team })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            const team = await updateTeam(Number(req.params.id), req.body)
            res.json({ team })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .delete(async (req, res) => {
        try {
            const team = await deleteTeam(Number(req.params.id))
            res.json({ team })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

export default teamRouter