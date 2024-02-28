import { ContactType } from "../types";

const contacts:ContactType[] = [
    { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        phoneNumber: '+1234567890', 
        avatarUrl: 'https://i.pravatar.cc/150?u=John+Doe', 
        labels:[
            { id: 1, name: 'Urgente', description: 'Etiqueta para problemas que requieren atención inmediata.' },
            { id: 2, name: 'Prioridad Baja', description: 'Etiqueta para problemas con baja prioridad.' },
        ],
        socialMedia: [
            { id: 1, name: 'Twitter', url: 'https://twitter.com/johndoe', displayText: '@johndoe' },
            { id: 2, name: 'LinkedIn', url: 'https://www.linkedin.com/in/johndoe', displayText: 'John Doe' }
        ]
    },
    { 
        id: 2, 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        phoneNumber: '+1987654321', 
        avatarUrl: 'https://i.pravatar.cc/150?u=Jane+Smith', 
        labels:[
            { id: 2, name: 'Prioridad Baja', description: 'Etiqueta para problemas con baja prioridad.' },
        ],
        socialMedia: [
            { id: 1, name: 'Twitter', url: 'https://twitter.com/janesmith', displayText: '@janesmith' }
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

type GetContactsType = (label?:undefined | number) => Promise<ContactType[]>
type SaveNewContactType = (newContact:Omit<ContactType, "id">) => Promise<ContactType>
type GetContactByIdType = (id:ContactType["id"]) => Promise<ContactType>
type UpdateContactType = (id:ContactType, newData:Partial<ContactType>) => Promise<ContactType>
type DeleteContactType = (id:ContactType) => Promise<ContactType>