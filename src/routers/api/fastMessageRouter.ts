import { Router } from "express";
import { FastMediaMessageType, FastMessageType } from "../../libs/schemas";
import {
    getFastMessages,
    saveNewFastMessage,
    updateFastMessage,
    deleteFastMessage,
    getFastMediaMessages,
    saveNewFastMediaMessage,
    getFastMediaMessageById,
    updateFastMediaMessage,
    deleteFastMediaMessage
} from "../../service/fastMessageService";
import { errorResponse } from "../../service/errorService";
import { getClientList } from "../../app";
import SocketPool from "../../libs/socketConnectionPool";

const clients = getClientList()
const fastRouter = Router();

interface Body{
    fastMessage:FastMessageType,
    fastMediaMessage: FastMediaMessageType[]
}

fastRouter.ws('/send/:id_inbox', async(ws, rq)=>{
    const poll = SocketPool.getInstance()

    const baileys = poll.getBaileysConnection(rq.params.id_inbox)

})
fastRouter.route("/")
    .get(async (req, res) => {
        try {
            const fastMessages = await getFastMessages();
            return res.json({ fastMessages });
        } catch (e) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        const body :Body = req.body
        try {
            const data = await saveNewFastMessage({...body.fastMessage, adminId:req.identity.id}, {fastMediaMessage:body.fastMediaMessage});
            res.json({ ...data });
        } catch (e) {
            return errorResponse(res, e)
        }
    })

fastRouter.route("/:id")
    .put(async (req, res) => {
        try {
            const body: Body = req.body;
        
            const fastMessages = await updateFastMessage(parseInt(req.params.id), body.fastMessage, {fastMediaMessage:body.fastMediaMessage});
            return res.json({ fastMessages });
        } catch (e) {
            return errorResponse(res, e)
        }
    })
    .delete(async (req, res) => {
        try {
            deleteFastMessage(parseInt(req.params.id));
            res.json({ message: 'Mensaje eliminado exitosamente' });
        } catch (e) {
            return errorResponse(res, e)
        }
    })
fastRouter.route("/media")
    .get(async (req, res) => {
        try {
            const fastMediaMessages = await getFastMediaMessages();
            res.json({ fastMediaMessages });
        } catch (e) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            const newMediaMessage = req.body;
            const savedFastMediaMessage = await saveNewFastMediaMessage(newMediaMessage);
            res.json({ savedFastMediaMessage });
        } catch (e) {
            return errorResponse(res, e)
        }
    })


fastRouter.route("/media/:id")
    .get(async (req, res) => {
        try {
            const { id } = req.params;
            const fastMediaMessages = await getFastMediaMessageById(parseInt(id));
            if (fastMediaMessages) {
                res.json({ fastMediaMessages });
            } else {
                res.status(404).json({ message: 'Mensaje de media no encontrado' });
            }
        } catch (e) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            const { id } = req.params;
            const updatedMediaMessage = req.body;
            const fastMediaMessages = await updateFastMediaMessage(parseInt(id), updatedMediaMessage);
            res.json({ fastMediaMessages });
        } catch (e) {
            return errorResponse(res, e)
        }
    })
    .delete(async (req, res) => {
        try {
            const { id } = req.params;
            await deleteFastMediaMessage(parseInt(id));
            res.json({ message: 'Mensaje de media eliminado exitosamente' });
        } catch (e) {
            return errorResponse(res, e)
        }
    })

export default fastRouter;
