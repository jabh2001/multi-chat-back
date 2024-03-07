import { z } from "zod";

export const userSchema = z.object({
    id:z.number().positive(),
    name:z.string({ required_error:"Name is required" }).max(50, "Name length max 50 character"),
    email:z.string().email("Email format error"),
    password:z.string().min(8, "Min 8 characters").max(16, "Password too long"),
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
    email:z.string().email("Email format error"),
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
    displayText:z.string().max(50)
})

export const messageSchema = z.object({
    id:z.number().positive(),
    conversationId:z.number().positive(),
    senderId:z.number().positive().optional(),
    content:z.string(),
    contentType:z.string(),
    messageType:z.enum(["incoming", "outgoing"]),
    private:z.boolean().default(false),
    createdAt:z.date().optional(),
})

export type UserType = z.infer<typeof userSchema>
export type LabelType = z.infer<typeof labelSchema>
export type TeamType = z.infer<typeof teamSchema>
export type ContactType = z.infer<typeof contactSchema>
export type SocialMediaType = z.infer<typeof socialMediaSchema>
export type InboxType = z.infer<typeof inboxSchema>
export type MessageType = z.infer<typeof messageSchema>