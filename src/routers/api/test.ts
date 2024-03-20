
import { Router } from "express"
import { Boom } from "@hapi/boom"
import { ContactModel, ConversationModel, InboxModel, MessageModel, SocialMediaModel } from "../../libs/models"
import { getWss } from "../../app"
import { Join } from "../../libs/orm/query"
import client from "../../libs/dataBase"
import SocketPool from "../../libs/socketConnectionPool"
import { DisconnectReason } from "@whiskeysockets/baileys"


const testRouter = Router()

testRouter.route("/")
    .get(async (req, res) => {
        // const query1 = await ConversationModel.query.filter(ConversationModel.c.inboxId.equalTo(1)).fetchAllQuery()
        // // console.log(query1.getSQL())
        // const query = ContactModel.query.select(ContactModel.c.name, SocialMediaModel.c.name.label("socialMediaName")).join(SocialMediaModel.r.contact, Join.INNER)
        // console.log(query.getSQL())
        // const result = await query.fetchAllQuery()
        // // const result = await client.query(`ation.id) from conversation`)
        await MessageModel.delete.filter(MessageModel.c.id.equalTo(9)).fetchAllQuery()
        await MessageModel.delete.filter(MessageModel.c.id.equalTo(10)).fetchAllQuery()
        await MessageModel.delete.filter(MessageModel.c.id.equalTo(11)).fetchAllQuery()
        res.send("its ok!")
    })
    
    
export default testRouter