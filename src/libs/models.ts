import { Column, Model } from "./orm"
import { BooleanColumn, IntColumn, SerialColumn, StringColumn, TimeStampColumn } from "./orm/column"


const UserModel = (
    new Model("user",[
        new SerialColumn("id", true),
        new StringColumn("name", 50, { nullable:false }),
        new StringColumn("email", 100, { nullable:false }),
        new StringColumn("password", 0, { nullable:false }),
        new StringColumn("role", 8, { nullable:false }),
    ])
)

const LabelModel = (
    new Model("label", [
        new SerialColumn("id", true),
        new StringColumn("name", 50),
        new StringColumn("description"),
    ])
)

const TeamModel = (
    new Model("team", [
        new SerialColumn("id", true),
        new StringColumn("name", 50),
        new StringColumn("description"),
    ])
)

const ContactModel = (
    new Model("contact", [
        new SerialColumn("id", true),
        new StringColumn("name", 50, { nullable:false }),
        new StringColumn("email", 100, { nullable:false }),
        new StringColumn("phoneNumber", 15),
        new StringColumn("avatarUrl", 255),
    ])
)

type SocialNetwork = "facebook" | "gmail" | "instagram" | "whatsapp" | "telegram" | "linkedin" | "threads"

const SocialMediaModel = (
    new Model("social_media", [
        new SerialColumn("id", true),
        new IntColumn("contactId", 0, { nullable:false, foreign:ContactModel.c.id }),
        new StringColumn("name", 100, { nullable:false }),
        new StringColumn("url"),
        new StringColumn("displayText", 50),
    ])
)
const ContactLabelModel = (
    new Model("contact_label", [
        new IntColumn("contactId", 0, { foreign:ContactModel.c.id }),
        new IntColumn("labelId", 0, { foreign:LabelModel.c.id }),
    ])
)
const UserTeamModel = (
    new Model("contact_label", [
        new IntColumn("userId", 0, { foreign:UserModel.c.id }),
        new IntColumn("teamId", 0, { foreign:TeamModel.c.id }),
    ])
)

const InboxModel = (
    new Model("inbox", [
        new SerialColumn("id", true),
        new StringColumn("name", 50, { nullable:false, unique:true }),
        new StringColumn("channelType"),
    ])
)

const ConversationModel = (
    new Model("conversation", [
        new SerialColumn("id", true),
        new IntColumn("inboxId", 0, { foreign:InboxModel.c.id, nullable:false }),
        new IntColumn("senderId", 0, { foreign:ContactModel.c.id, nullable:false }),
        new IntColumn("assignedUserId", 0, { foreign:UserModel.c.id, nullable:true }),
        new IntColumn("assignedTeamId", 0, { foreign:TeamModel.c.id, nullable:true }),
        new TimeStampColumn("createdAt")
    ])
)


const MessageModel = (
    new Model("message", [
        new SerialColumn("id", true),
        new StringColumn("content"),
        new StringColumn("contentType", 50),
        new StringColumn("messageType", 50),
        new BooleanColumn("private"),
        new TimeStampColumn("createdAt"),
    ])
)

export {
    Column,
    Model,
    TeamModel,
    LabelModel,
    ContactModel,
    ContactLabelModel,
    SocialMediaModel,
    UserModel,
    InboxModel,
    ConversationModel,
    MessageModel,
}