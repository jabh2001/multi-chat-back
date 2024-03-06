import { ContactLabelModel, ContactModel, LabelModel, SocialMediaModel } from "../libs/models";
import { ContactType, LabelType, SocialMediaType } from "../types";
import { getLabels } from "./labelService";

export const getContacts:GetContactsType = async (labelId=undefined) => {
    const contacts = await ContactModel.query.fetchAllQuery<ContactType>()
    return contacts
}

export const saveNewContact:SaveNewContactType = async (newContact) => {
    return await ContactModel.insert.values(newContact).fetchOneQuery<ContactType>()
}

export const getContactById:GetContactByIdType = async (id) => {
    return await ContactModel.query.filter(ContactModel.c.id.equalTo(id)).fetchOneQuery<ContactType>()
}

export const updateContact:UpdateContactType = async (contact, newData) => {
    return await ContactModel.update.values(newData).filter(ContactModel.c.id.equalTo(contact.id)).fetchOneQuery()
}
export const deleteContact:DeleteContactType = async (contact) => {
    return await ContactModel.delete.filter(ContactModel.c.id.equalTo(contact.id)).fetchOneQuery()
}

export const getContactLabels:getContactLabelsType = async (contact) => {
    return await LabelModel.query.join(ContactLabelModel, ContactLabelModel.c.labelId).filter(ContactLabelModel.c.contactId.equalTo(contact.id)).fetchAllQuery<LabelType>()
}

export const updateContactLabel:UpdateContactLabelType = async (contact, labels) => {
    await ContactLabelModel.delete.filter(ContactLabelModel.c.contactId.equalTo(contact.id)).fetchOneQuery();
    const values = labels.map(l => ({ contactId:contact.id, labelId:l }))
    await ContactLabelModel.insert.values(...values).fetchOneQuery()
    return await getContactLabels(contact);
}

export const getContactSocialMedia:getContactSocialMediaType = async (contact) => {
    return await SocialMediaModel.query.filter(SocialMediaModel.c.contactId.equalTo(contact.id)).fetchAllQuery()
}
export const saveNewContactSocialMedia:saveNewContactSocialMediaType = async (contact, newSocialMedia) => {
    return await SocialMediaModel.insert.values({ ...newSocialMedia, contactId:contact.id }).fetchOneQuery()
}

export const updateSocialMedia:updateSocialMediaType = async (socialMediaId, newData) => {
    return await SocialMediaModel.update.values(newData).filter(SocialMediaModel.c.id.equalTo(socialMediaId)).fetchOneQuery()
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