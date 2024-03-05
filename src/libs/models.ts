import { Column, Model } from "./pgQuery"

const TeamModel = (
    new Model("team")
    .addColumn(Column.primary("id"))
    .addColumn("name")
    .addColumn("description")
)

const LabelModel = (
    new Model("label")
    .addColumn(Column.primary("id"))
    .addColumn("name")
    .addColumn("description")
)
const ContactModel = (
    new Model("contact")
    .addColumn(Column.primary("id"))
    .addColumn("name")
    .addColumn("email")
    .addColumn("phoneNumber")
    .addColumn("avatarUrl")
)

type SocialNetwork = "facebook" | "gmail" | "instagram" | "whatsapp" | "telegram" | "linkedin" | "threads"

const SocialMediaModel = (
    new Model("social_media")
    .addColumn(Column.primary("id"))
    .addColumn("contactId")
    .addColumn("name")
    .addColumn("url")
    .addColumn("displayText")
)
const ContactLabelModel = (
    new Model("contact_label")
    .addColumn("contactId")
    .addColumn("labelId")
)

const UserModel = (
    new Model("user")
    .addColumn(Column.primary("id"))
    .addColumn("name")
    .addColumn("email")
    .addColumn("role")
)

const InboxModel = (
    new Model("inbox")
    .addColumn(Column.primary("id"))
    .addColumn("name")
    .addColumn("channelType")
)

const ConversationModel = (
    new Model("conversation")
    .addColumn(Column.primary("id"))
    .addColumn("accountId")
    .addColumn("inboxId")
    .addColumn("senderId")
    .addColumn("userId")
)


const MessageModel = (
    new Model("message")
    .addColumn(Column.primary("id"))
    .addColumn("conversationId")
    .addColumn("content")
    .addColumn("contentType")
    .addColumn("messageType")
    .addColumn("private")
    .addColumn("createdAt")
)


// async function main(){
//     const result = await ContactModel.query.join(SocialMediaModel, SocialMediaModel.c.contactId).fetchAllQuery()
//     console.log(result)

// }
// main()
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