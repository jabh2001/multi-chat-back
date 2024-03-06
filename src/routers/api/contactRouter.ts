import { NextFunction, Request, Response, Router } from "express"
import { deleteContact, getContactById, getContactLabels, getContactSocialMedia, getContacts, saveNewContact, saveNewContactSocialMedia, updateContact, updateContactLabel, updateSocialMedia } from "../../service/contactService"
import { SocialMediaModel } from "../../libs/models"
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
        res.json({ labels:await getContactLabels(req.contact) })
    })
    .put(async (req, res) => {
        const contact = await updateContactLabel(req.contact, req.body)
        res.json({ contact })
    })
contactRouter.route("/:id/social-media")
    .get(async (req, res) => {
        res.json({ socialMedia:await getContactSocialMedia(req.contact) })
    })
    .post(async (req, res) => {
        const socialMedia = await saveNewContactSocialMedia(req.contact, req.body)
        res.json({ socialMedia })
    })

contactRouter.route("/:id/social-media/:socialMediaId")
    .get(async (req, res) => {
        const socialMedia = await SocialMediaModel.query.filter(SocialMediaModel.c.id.equalTo(req.params.socialMediaId)).fetchOneQuery<any>()
        if (!socialMedia || req.contact.id !== socialMedia.contactId){
            return res.status(404).json({error : 'Social Media not found'}).end()
        }
        res.json({ socialMedia })
    })
    .put(async (req, res) => {
        const socialMedia = await SocialMediaModel.repository.update(req.params.socialMediaId, req.body)
        if (!socialMedia){
            return res.status(404).json({error : 'Social Media not found'}).end()
        }
        res.json({ socialMedia })
    })

export default contactRouter