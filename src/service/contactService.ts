import { Request } from "express";
import { getClientList } from "../app";
import { ContactLabelModel, ContactModel, LabelModel, SocialMediaModel } from "../libs/models";
import { Join } from "../libs/orm/query";
import { contactSchema, socialMediaSchema } from "../libs/schemas";
import { ContactType, LabelType, SocialMediaType } from "../types";
import { getContactAvatar, saveContactAvatar } from "./fileService";

const sseClients = getClientList()

export const getContactAvatarUrl = (req:Request, contactId:any) =>{
    return `${req.protocol}://${req.get("host")}/img/contact/${contactId}`
}
export const getContacts:GetContactsType = async (labelId=undefined) => {
    let contactsQuery = ContactModel.query
    if(labelId){
        contactsQuery = (
            contactsQuery
            .select(...Object.values(ContactModel.c))
            .join(ContactLabelModel, ContactLabelModel.c.contactId, ContactModel.c.id)
            .filter(ContactLabelModel.c.labelId.equalTo(labelId))
            .groupBy(ContactModel.c.id)
        )
    }
    const contacts = await contactsQuery.fetchAllQuery<ContactType>()
    return contacts
}

export const saveNewContact:SaveNewContactType = async (newContact:any) => {
    const newData = contactSchema.omit({ id:true, avatarUrl:true }).parse(newContact)
    const contact = await ContactModel.insert.values({...newData, avatarUrl:""}).fetchOneQuery<ContactType>()
    await saveContactAvatar(contact.id, newContact.picture)
    sseClients.emitToClients("insert-contact", {...contact, avatarUrl: await getContactAvatar(contact.id)})
    return {...contact, avatarUrl: await getContactAvatar(contact.id)}
}

export const getContactById:GetContactByIdType = async (id) => {
    return await ContactModel.query.filter(ContactModel.c.id.equalTo(id)).fetchOneQuery<ContactType>()
}

export const getOrCreateContactByPhoneNumber = async (phoneNumber:string, contactName:string) => {
    const existingContact =  await ContactModel.query.filter(ContactModel.c.phoneNumber.equalTo(phoneNumber)).fetchAllQuery<ContactType>()
    
    if(existingContact.length > 0){
        return existingContact[0]
    }
    const contact = await saveNewContact({ phoneNumber, name:contactName })
    return contact
}

export const updateContact:UpdateContactType = async (contact, newContact:any) => {
    const newData = contactSchema.omit({ id:true, avatarUrl:true }).partial().partial().parse(newContact)
    if(Object.keys(newData).length == 0){
        return await getContactById(contact.id)
    }
    const contact_ = await ContactModel.update.values(newData).filter(ContactModel.c.id.equalTo(contact.id)).fetchOneQuery<ContactType>()
    let avatarUrl
    if(newContact.picture){
        await saveContactAvatar(contact.id, newContact.picture)
        avatarUrl = await getContactAvatar(contact.id)
    }
    sseClients.emitToClients("update-contact", {...contact_, avatarUrl})
    return contact_
}
export const deleteContact:DeleteContactType = async (contact) => {
    const contact_ = await ContactModel.delete.filter(ContactModel.c.id.equalTo(contact.id)).fetchOneQuery<ContactType>()
    sseClients.emitToClients("delete-contact", [contact.id])
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
type SaveNewContactType = (newContact:Partial<Omit<ContactType, "id">>) => Promise<ContactType>
type GetContactByIdType = (id:ContactType["id"]) => Promise<ContactType>
type UpdateContactType = (contact:ContactType, newData:Partial<ContactType>) => Promise<ContactType>
type DeleteContactType = (contact:ContactType) => Promise<ContactType>
type getContactLabelsType = (contact:ContactType) => Promise<LabelType[]>
type UpdateContactLabelType = (contact:ContactType, labels:LabelType["id"][]) => Promise<LabelType[]>
type getContactSocialMediaType = (contact:ContactType) => Promise<SocialMediaType[]>
type saveNewContactSocialMediaType = (contact:ContactType, socialMedia:Omit<SocialMediaType, "id">) => Promise<SocialMediaType>
type updateSocialMediaType = (socialMediaId:SocialMediaType["id"], socialMedia:Partial<SocialMediaType>) => Promise<SocialMediaType>