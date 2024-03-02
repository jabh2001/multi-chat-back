import { NextFunction, Request, Response, Router } from "express"
import { deleteContact, getContactById, getContacts, saveNewContact, saveNewContactSocialMedia, updateContact, updateContactLabel, updateSocialMedia } from "../../service/contactService"
const contactRouter = Router()

const getModelMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    try {

        const contact = await getContactById(Number(req.params.id))
        req.contact = contact
    } catch(e) {
        return res.status(404).json({ error : 'Contact not found'})
    }
    next()

}
contactRouter.use("/:id", getModelMiddleware)
contactRouter.use("/:id/labels", getModelMiddleware)
contactRouter.use("/:id/social-media", getModelMiddleware)

contactRouter.route("/")
    .get(async(req, res) => {
        const label = req.query.label
        const contacts = await getContacts(label ? Number(label) : undefined)
        res.json({ contacts })
    })
    .post(async (req, res) => {
        const contact = await saveNewContact(req.body)
        res.json({ contact })
    })

contactRouter.route("/:id")
    .get(async (req, res) => {
        res.json({ contact:req.contact })
    })
    .put(async (req, res) => {
        const contact = await updateContact(req.contact, req.body)
        res.json({ contact })
    })
    .delete(async (req, res) => {
        const contact = await deleteContact(req.contact)
        res.json({ contact })
    })

    contactRouter.route("/:id/labels")
    .get(async (req, res) => {
        res.json({ labels:req.contact.labels })
    })
    .put(async (req, res) => {
        const contact = await updateContactLabel(req.contact, req.body)
        res.json({ contact })
    })
contactRouter.route("/:id/social-media")
    .get(async (req, res) => {
        res.json({ socialMedia:req.contact.socialMedia })
    })
    .post(async (req, res) => {
        const socialMedia = await saveNewContactSocialMedia(req.contact, req.body)
        res.json({ socialMedia })
    })

contactRouter.route("/:id/social-media/:socialMediaId")
    .get(async (req, res) => {
        const socialMedia = req.contact.socialMedia.find(s => s.id === Number(req.params.socialMediaId))
        if (!socialMedia){
            return res.status(404).json({error : 'Social Media not found'}).end()
        }
        res.json({ socialMedia })
    })
    .put(async (req, res) => {
        const socialMedia = req.contact.socialMedia.find(s => s.id === Number(req.params.socialMediaId))
        if (!socialMedia){
            return res.status(404).json({error : 'Social Media not found'}).end()
        }

        const newSocialMedia = await updateSocialMedia(socialMedia.id, req.body)
        res.json({ socialMedia:newSocialMedia })
    })

export default contactRouter