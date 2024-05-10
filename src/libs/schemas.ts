import { z } from "zod";

export const userSchema = z.object({
    id:z.number().positive(),
    name:z.string({ required_error:"Name is required" }).max(50, "Name length max 50 character"),
    email:z.string().email("Email format error"),
    password:z.string().min(8, "Min 8 characters").max(32, "Password too long"),
    role:z.enum(["admin", "agent"]),
})

export const labelSchema = z.object({
    id:z.number().positive(),
    name:z.string({ required_error:"Name is required" }).max(50, "Name length max 50 character"),
    description:z.string(),
})

export const teamSchema = z.object({
    id:z.number().positive(),
    name:z.string({ required_error:"Name is required" }).max(50, "Name length max 50 character"),
    description:z.string(),
})

export const contactSchema = z.object({
    id:z.number().positive(),
    name:z.string({ required_error:"Name is required" }).max(50, "Name length max 50 character"),
    email:z.string().email("Email format error").optional(),
    phoneNumber:z.string().max(16, "Phone too long"),
    avatarUrl:z.string().max(255, "Url too long 255 chars"),
})

export const socialMediaSchema = z.object({
    id:z.number().positive(),
    contactId:z.number().positive(),
    name:z.enum(["facebook", "gmail", "instagram", "whatsapp", "telegram", "linkedin", "threads"]),
    url:z.string().url(),
    displayText:z.string().max(50)
})

export const inboxSchema = z.object({
    id:z.number().positive(),
    name:z.string({ required_error:"Name is required" }).max(50, "Name length max 50 character"),
    channelType:z.enum(["whatsapp"])
})
export const conversationSchema = z.object({
    id:z.number().positive().optional(),
    inboxId:z.number().positive(),
    senderId:z.number().positive(),
    assignedUserId:z.number().positive().optional(),
    assignedTeamId:z.number().positive().optional(),
})

const bufferItemSchema = z.object({
    tipo: z.string(),
    base64: z.string(),
    caption: z.string()
});
export const messageSchema = z.object({
    id: z.number().positive(),
    buffer: z.string().optional(), 
    bufferType: z.string().optional(),
    conversationId: z.number().positive(),
    senderId: z.number().positive().optional(),
    content: z.string().optional(),
    whatsappId: z.string(),
    status: z.boolean().optional(),
    contentType: z.string(),
    messageType: z.enum(["incoming", "outgoing"]),
    private: z.boolean().default(false),
    createdAt: z.date().optional(),
    listBufferBase64:z.array(bufferItemSchema).optional()
});

export const fastMediaMessageSchema = z.object(
    {
        id:z.number().positive(),
        fastMessageId: z.number().positive(),
        text:z.string().default(""),
        messageType:z.string(),
        base64: z.string().optional(),
        order:z.number(),
    }
)
export const fastMessageSchema = z.object(
    {
        id: z.number().positive(),  
        title: z.string(),
        adminId: z.number().positive(),
        keyWords: z.string(),
        admin: userSchema.optional(),
        fastMediaMessages: z.array(fastMediaMessageSchema).optional()
    }
)
export const conversationNoteSchema = z.object({
    id: z.number().positive(),
    userId: z.number().positive(), 
    conversationId: z.number().positive(),
    content: z.string(),
    important: z.boolean(),
    createdAt: z.date().optional(),
});


export type UserType = z.infer<typeof userSchema>
export type LabelType = z.infer<typeof labelSchema>
export type TeamType = z.infer<typeof teamSchema>
export type ContactType = z.infer<typeof contactSchema>
export type SocialMediaType = z.infer<typeof socialMediaSchema>
export type InboxType = z.infer<typeof inboxSchema>
export type ConversationSchemaType = z.infer<typeof conversationSchema>
export type MessageType = z.infer<typeof messageSchema>
export type FastMessageType = z.infer<typeof fastMessageSchema>
export type FastMediaMessageType = z.infer<typeof fastMediaMessageSchema>
export type ConversationNoteType = z.infer<typeof conversationNoteSchema>
