export type TeamType = {
    id:number
    name:string
    description:string
}
export type LabelType = {
    id:number
    name:string
    description:string
}
export type UserType = {
    id:number
    name:string
    email:string
    role:"admin" | "agent"
    teams:TeamType[]
}
export type AgentType = UserType

export type SocialMediaType = {
    id:number
    name:"facebook" | "gmail" | "instagram" | "whatsapp" | "telegram" | "linkedin" | "threads"
    url:string
    displayText:string
}

export type ContactType = {
    id:number
    name:string
    email?:string 
    phoneNumber:string
    avatarUrl:string
    labels:LabelType[]
    socialMedia:SocialMediaType[]
}

export type InboxType = {
    id:number
    name:string
    channel_type:"api" | "whats-app" | "telegram"
}

export type ConversationType = {
    id: number,
    contact:ContactType,
    inbox:InboxType,
    unread_count:number,
    messages:MessageType[],
}
export type MessageType = {
    id: number,
    content:string
    contentType:"text"
    messageType:"incoming" | "outgoing"
    private:boolean
    createdAt:Date
    user?:UserType
}

export type WSMessageUpsertType = ContactType & { 
    base64Buffer:Base64Buffer|null
    conversation:ConversationType
    text:string | null | undefined 
    fromMe:boolean
    messageID:string
    listBufferBase64?: Base64Buffer[]
}

export type Base64Buffer= {
    base64:string |null,
    tipo:string|null,
    caption?:string|null
}