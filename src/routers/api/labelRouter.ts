import { Router } from "express"
import { deleteLabel, getLabelById, getTeams, saveNewLabel, updateLabel } from "../../service/labelService"
const labelRouter = Router()

labelRouter.route("/")
    .get(async(req, res) => {
        const labels = await getTeams()
        res.json({ labels })
    })
    .post(async (req, res) => {
        const label = await saveNewLabel(req.body)
        res.json({ label })
    })
    
labelRouter.route("/:id")
    .get(async (req, res) => {
        const label = await getLabelById(Number(req.params.id))
        res.json({ label })
    })
    .put(async (req, res) => {
        const label = await updateLabel(Number(req.params.id), req.body)
        res.json({ label })
    })
    .delete(async (req, res) => {
        const label = await deleteLabel(Number(req.params.id))
        res.json({ label })
    })

export default labelRouter