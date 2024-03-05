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
}