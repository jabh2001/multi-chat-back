import { getClientList } from "../app";
import { ContactLabelModel, ContactModel, LabelModel, SocialMediaModel } from "../libs/models";
import { Join } from "../libs/orm/query";
import { contactSchema, socialMediaSchema } from "../libs/schemas";
import { ContactType, LabelType, SocialMediaType } from "../types";

const sseClients = getClientList()

export const getContacts:GetContactsType = async (labelId=undefined) => {
    const contacts = await ContactModel.query.fetchAllQuery<ContactType>()
    return contacts
}

export const saveNewContact:SaveNewContactType = async (newContact) => {
    const newData = contactSchema.omit({ id:true, avatarUrl:true }).parse(newContact)
    const contact = await ContactModel.insert.values({...newData, avatarUrl:newData.name.replace(" ", "_") + ".png"}).fetchOneQuery<ContactType>()
    sseClients.emitToClients("insert-contact", contact)
    return contact
}

export const getContactById:GetContactByIdType = async (id) => {
    return await ContactModel.query.filter(ContactModel.c.id.equalTo(id)).fetchOneQuery<ContactType>()
}

export const updateContact:UpdateContactType = async (contact, newContact) => {
    const newData = contactSchema.omit({ id:true }).partial().parse(newContact)
    if(Object.keys(newData).length == 0){
        return await getContactById(contact.id)
    }
    const contact_ = await ContactModel.update.values(newData).filter(ContactModel.c.id.equalTo(contact.id)).fetchOneQuery<ContactType>()
    sseClients.emitToClients("update-contact", contact_)
    return contact_
}
export const deleteContact:DeleteContactType = async (contact) => {
    const contact_ = await ContactModel.delete.filter(ContactModel.c.id.equalTo(contact.id)).fetchOneQuery<ContactType>()
    sseClients.emitToClients("delete-contact", [contact_.id])
    return contact_
}

export const getContactLabels:getContactLabelsType = async (contact) => {
    return await LabelModel.query.join(ContactLabelModel, ContactLabelModel.c.labelId, LabelModel.c.id, Join.INNER).filter(ContactLabelModel.c.contactId.equalTo(contact.id)).fetchAllQuery<LabelType>()
}

export const updateContactLabel:UpdateContactLabelType = async (contact, labels) => {
    await ContactLabelModel.delete.filter(ContactLabelModel.c.contactId.equalTo(contact.id)).execute();
    const values = [...new Set(labels)].map(l => ({ contactId:contact.id, labelId:l }))
    await ContactLabelModel.insert.values(...values).fetchOneQuery()
    return await getContactLabels(contact);
}

export const getContactSocialMedia:getContactSocialMediaType = async (contact) => {
    return await SocialMediaModel.query.filter(SocialMediaModel.c.contactId.equalTo(contact.id)).fetchAllQuery()
}
export const saveNewContactSocialMedia:saveNewContactSocialMediaType = async (contact, newSocialMedia) => {
    const newData = socialMediaSchema.omit({ id:true, contactId:true }).parse(newSocialMedia)
    return await SocialMediaModel.insert.values({ ...newData, contactId:contact.id }).fetchOneQuery()
}

export const updateSocialMedia:updateSocialMediaType = async (socialMediaId, newSocialMedia) => {
    const newData = socialMediaSchema.omit({ id:true, contactId:true }).partial().parse(newSocialMedia)
    return await SocialMediaModel.update.values(newData).filter(SocialMediaModel.c.id.equalTo(socialMediaId)).fetchOneQuery()
}

export const deleteSocialMedia:updateSocialMediaType = async (socialMediaId) => {
    return await SocialMediaModel.delete.filter(SocialMediaModel.c.id.equalTo(socialMediaId)).execute()
}

type GetContactsType = (label?:undefined | number) => Promise<ContactType[]>
type SaveNewContactType = (newContact:Omit<ContactType, "id">) => Promise<ContactType>
type GetContactByIdType = (id:ContactType["id"]) => Promise<ContactType>
type UpdateContactType = (contact:ContactType, newData:Partial<ContactType>) => Promise<ContactType>
type DeleteContactType = (contact:ContactType) => Promise<ContactType>
type getContactLabelsType = (contact:ContactType) => Promise<LabelType[]>
type UpdateContactLabelType = (contact:ContactType, labels:LabelType["id"][]) => Promise<LabelType[]>
type getContactSocialMediaType = (contact:ContactType) => Promise<SocialMediaType[]>
type saveNewContactSocialMediaType = (contact:ContactType, socialMedia:Omit<SocialMediaType, "id">) => Promise<SocialMediaType>
type updateSocialMediaType = (socialMediaId:SocialMediaType["id"], socialMedia:Partial<SocialMediaType>) => Promise<SocialMediaType>