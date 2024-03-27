import { NextFunction, Request, Response, Router } from "express"
import { deleteContact, deleteSocialMedia, getContactById, getContactLabels, getContactSocialMedia, getContacts, saveNewContact, saveNewContactSocialMedia, updateContact, updateContactLabel, updateSocialMedia } from "../../service/contactService"
import { SocialMediaModel } from "../../libs/models"
import { errorResponse } from "../../service/errorService"
const contactRouter = Router()

const getModelMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const contact = await getContactById(Number(req.params.id))
        req.contact = contact
    } catch (e: any) {
        return errorResponse(res, e)
    }
    next()

}
contactRouter.use("/:id", getModelMiddleware)
contactRouter.use("/:id/labels", getModelMiddleware)
contactRouter.use("/:id/social-media", getModelMiddleware)

contactRouter.route("/")
    .get(async (req, res) => {
        try {
            const label = req.query.label
            const contacts = await getContacts(label ? Number(label) : undefined)
            res.json({ contacts })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            const contact = await saveNewContact(req.body)
            res.json({ contact })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

contactRouter.route("/:id")
    .get(async (req, res) => {
        try {
            res.json({ contact: req.contact })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            const contact = await updateContact(req.contact, req.body)
            res.json({ contact })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .delete(async (req, res) => {
        try {
            const contact = await deleteContact(req.contact)
            res.json({ contact })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

contactRouter.route("/:id/labels")
    .get(async (req, res) => {
        try {
            res.json({ labels: await getContactLabels(req.contact) })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            const labels = await updateContactLabel(req.contact, req.body)
            res.json({ labels })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
contactRouter.route("/:id/social-media")
    .get(async (req, res) => {
        try {
            res.json({ socialMedia: await getContactSocialMedia(req.contact) })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .post(async (req, res) => {
        try {
            const socialMedia = await saveNewContactSocialMedia(req.contact, req.body)
            res.json({ socialMedia })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

contactRouter.route("/:id/social-media/:socialMediaId")
    .get(async (req, res) => {
        try {
            const socialMedia = await SocialMediaModel.query.filter(SocialMediaModel.c.id.equalTo(req.params.socialMediaId)).fetchOneQuery<any>()
            if (!socialMedia || req.contact.id !== socialMedia.contactId) {
                return res.status(404).json({ error: 'Social Media not found' }).end()
            }
            res.json({ socialMedia })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .put(async (req, res) => {
        try {
            const socialMedia = await updateSocialMedia(Number(req.params.socialMediaId), req.body)
            if (!socialMedia) {
                return res.status(404).json({ error: 'Social Media not found' }).end()
            }
            res.json({ socialMedia })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })
    .delete(async (req, res) => {
        try {
            const socialMedia = await deleteSocialMedia(Number(req.params.socialMediaId), req.body)
            if (!socialMedia) {
                return res.status(404).json({ error: 'Social Media not found' }).end()
            }
            res.json({ socialMedia })
        } catch (e: any) {
            return errorResponse(res, e)
        }
    })

export default contactRouter