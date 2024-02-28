import { Router } from "express"
import { deleteContact, getContactById, getContacts, saveNewContact, updateContact } from "../../service/contactService"
import { ContactType } from "../../types"
const contactRouter = Router()

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

contactRouter.use("/:id", async (req, res, next)=>{
    try {

        const contact = await getContactById(Number(req.params.id))
        req.contact = contact
    } catch(e) {
        return res.status(404).json({ error : 'Contact not found'})
    }
    next()
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

export default contactRouter