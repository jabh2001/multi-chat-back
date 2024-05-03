import { Router } from "express";
import { FastMessageType } from "../../libs/schemas";
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

const fastRouter = Router();

fastRouter.get('/', (req, res) => {
    const messages = getFastMessages();
    res.json(messages);
});

fastRouter.post('/', (req, res) => { 
    saveNewFastMessage(req.body);
    res.json(req.body);
});

fastRouter.put('/:id', (req, res) => {
    const body : FastMessageType = req.body;
    updateFastMessage(parseInt(req.params.id), body);
    res.json(body);
});

fastRouter.delete('/:id', (req, res) => {
    deleteFastMessage(parseInt(req.params.id));
    res.json({ message: 'Mensaje eliminado exitosamente' });
});

fastRouter.get('/media', async (req, res) => {
    const mediaMessages = await getFastMediaMessages();
    res.json(mediaMessages);
});

fastRouter.post('/media', async (req, res) => { 
    const newMediaMessage = req.body;
    const savedMediaMessage = await saveNewFastMediaMessage(newMediaMessage);
    res.json(savedMediaMessage);
});

fastRouter.get('/media/:id', async (req, res) => {
    const { id } = req.params;
    const mediaMessage = await getFastMediaMessageById(parseInt(id));
    if (mediaMessage) {
        res.json(mediaMessage);
    } else {
        res.status(404).json({ message: 'Mensaje de media no encontrado' });
    }
});

fastRouter.put('/media/:id', async (req, res) => {
    const { id } = req.params;
    const updatedMediaMessage = req.body;
    const result = await updateFastMediaMessage(parseInt(id), updatedMediaMessage);
    res.json(result);
});

fastRouter.delete('/media/:id', async (req, res) => {
    const { id } = req.params;
    await deleteFastMediaMessage(parseInt(id));
    res.json({ message: 'Mensaje de media eliminado exitosamente' });
});

export default fastRouter;
