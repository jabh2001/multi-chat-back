import { ContactType, LabelType, SocialMediaType } from "../types";
import { getLabels } from "./labelService";

const contacts:ContactType[] = [
    { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        phoneNumber: '+1234567890', 
        avatarUrl: 'https://i.pravatar.cc/150?u=Jhonder+Bastidas', 
        labels:[
            { id: 1, name: 'Urgente', description: 'Etiqueta para problemas que requieren atención inmediata.' },
            { id: 2, name: 'Prioridad Baja', description: 'Etiqueta para problemas con baja prioridad.' },
        ],
        socialMedia: [
            { id: 1, name: 'facebook', url: 'https://facebook.com/johndoe', displayText: '/johndoe' },
            { id: 2, name: 'instagram', url: 'https://www.instagram.com/johndoe', displayText: '@johndoe' },
            { id: 3, name: 'threads', url: 'https://threads.com/johndoe', displayText: '@johndoe' },
            { id: 4, name: 'linkedin', url: 'https://www.linkedin.com/in/johndoe', displayText: 'John Doe' }
        ]
    },
    { 
        id: 2, 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        phoneNumber: '+1987654321', 
        avatarUrl: 'https://i.pravatar.cc/150?u=Andrelis+Marsella', 
        labels:[
            { id: 2, name: 'Prioridad Baja', description: 'Etiqueta para problemas con baja prioridad.' },
        ],
        socialMedia: [
            { id:5, name: 'threads', url: 'https://threads.com/janesmith', displayText: '@janesmith' }
        ]
    }
]

export const getContacts:GetContactsType = async (labelId=undefined) => {
    return new Promise((resolve) =>{
        const copy = contacts.filter(el => labelId ? el.labels.map(l => l.id).includes(labelId) : el )
        resolve(copy.map(c => ({...c, labels:[], socialMedia:[]})))
    });
}

export const saveNewContact:SaveNewContactType = async (newContact) => {
    const contactWithId = { ...newContact, id: Math.max(...contacts.map(t=>t.id)) + 1 };
    contacts.push(contactWithId);
    return new Promise((resolve) => resolve(contactWithId))
}
export const getContactById:GetContactByIdType = async (id) => {
    const index = contacts.findIndex(t => t.id === id);
    if (index !== -1){
        return new Promise((resolve)=>resolve(contacts[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Contact not found"}))
}
export const updateContact:UpdateContactType = async (contact, newData) => {
    const index = contacts.findIndex(t => t.id === contact.id);
    if (index !== -1){
        contacts[index] = { ...contacts[index], ...newData}
        return new Promise((resolve)=>resolve(contacts[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Contact not found"}))
}
export const deleteContact:DeleteContactType = async (contact) => {
    const index = contacts.findIndex(t => t.id === contact.id);
    if (index !== -1){
        const [contact] = contacts.splice(index, 1)
        return new Promise((resolve)=>resolve(contact));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Team not found"}))
}

export const updateContactLabel:UpdateContactLabelType = async (contact, labels) => {
    const ls = await getLabels()
    contact.labels = ls.filter(l => labels.includes(l.id))
    return new Promise((resolve)=>resolve(contact.labels));
}
const getSocialMedias:() => Promise<SocialMediaType[]> = async () => {
    const socialMedias = contacts.reduce<SocialMediaType[]>((obj, contact)=>{
        return [...obj, ...contact.socialMedia]
    }, [])
    return new Promise((resolve)=>resolve(socialMedias));
}
export const saveNewContactSocialMedia:saveNewContactSocialMediaType = async (contact, newSocialMedia) => {
    const socialMedias = await getSocialMedias()
    const socialMediaWithId = { ...newSocialMedia, id: Math.max(...socialMedias.map(t=>t.id)) + 1 };
    contact.socialMedia.push(socialMediaWithId)
    return new Promise((resolve)=>resolve(socialMediaWithId));
}

export const updateSocialMedia:updateSocialMediaType = async (socialMediaId, newData) => {
    const contactIndex = contacts.findIndex(c => c.socialMedia.findIndex(sm => sm.id === socialMediaId)!== -1 )
    if (contactIndex !== -1){
        let contact = contacts[contactIndex];
        const socialMediaIndex = contact.socialMedia.findIndex(sm => sm.id == socialMediaId)
        if (socialMediaIndex != -1){
            contact.socialMedia[socialMediaIndex] = {...contact.socialMedia[socialMediaIndex], ...newData};
            return new Promise((resolve)=>resolve(contact.socialMedia[socialMediaIndex]));
        }
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Source not found"}))
}

type GetContactsType = (label?:undefined | number) => Promise<ContactType[]>
type SaveNewContactType = (newContact:Omit<ContactType, "id">) => Promise<ContactType>
type GetContactByIdType = (id:ContactType["id"]) => Promise<ContactType>
type UpdateContactType = (contact:ContactType, newData:Partial<ContactType>) => Promise<ContactType>
type DeleteContactType = (contact:ContactType) => Promise<ContactType>
type UpdateContactLabelType = (contact:ContactType, labels:number[]) => Promise<LabelType[]>
type saveNewContactSocialMediaType = (contact:ContactType, socialMedia:Omit<SocialMediaType, "id">) => Promise<SocialMediaType>
type updateSocialMediaType = (socialMediaId:SocialMediaType["id"], socialMedia:Partial<SocialMediaType>) => Promise<SocialMediaType>