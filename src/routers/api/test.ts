
import { Router } from "express"
import { Boom } from "@hapi/boom"
import { ContactModel, ConversationModel, InboxModel, SocialMediaModel } from "../../libs/models"
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
        const conn1 = SocketPool.getInstance().getBaileysConnection("rojo2")
        const conn2 = SocketPool.getInstance().getBaileysConnection("azul")
        if(conn1){
            try{
                // const res1 = await conn1.sock.sendMessage(`584269165534@s.whatsapp.net`, { text:"Hola"})
                // console.log({ res1 })
                await conn1.sock.sendPresenceUpdate("available")
            } catch (e) {
                if(e instanceof Boom && e.output.statusCode == DisconnectReason.connectionClosed){
                    conn1.logout()
                    console.log(`${conn1.folder} has been disconnected`)
                } else {
                    console.log(e)
                }
            }
        }
        res.send("its ok!")
    })
    
    
export default testRouter