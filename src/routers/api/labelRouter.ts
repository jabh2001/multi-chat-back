import { Router } from "express"
import { deleteLabel, getLabelById, getLabels, saveNewLabel, updateLabel } from "../../service/labelService"
import { errorResponse } from "../../service/errorService"
const labelRouter = Router()

labelRouter.route("/")
    .get(async (req, res) => {
        try {
            const labels = await getLabels()
            res.json({ labels })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            const label = await saveNewLabel(req.body)
            res.json({ label })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

labelRouter.route("/:id")
    .get(async (req, res) => {
        try {
            const label = await getLabelById(Number(req.params.id))
            res.json({ label })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            const label = await updateLabel(Number(req.params.id), req.body)
            res.json({ label })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .delete(async (req, res) => {
        try {
            const label = await deleteLabel(Number(req.params.id))
            res.json({ label })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

export default labelRouter