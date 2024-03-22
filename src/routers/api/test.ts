
import { Router } from "express"
import { Boom } from "@hapi/boom"
import { ContactModel, ConversationModel, InboxModel, MessageModel, SocialMediaModel } from "../../libs/models"
import { getWss } from "../../app"
import { Join, RawSQL } from "../../libs/orm/query"
import client from "../../libs/dataBase"
import SocketPool from "../../libs/socketConnectionPool"
import { DisconnectReason } from "@whiskeysockets/baileys"


const testRouter = Router()

testRouter.route("/")
    .get(async (req, res) => {
        const aliased = MessageModel.alias("m")
        
        const subquery = (
            aliased.query.select(aliased.c.content)
            .filter(aliased.c.conversationId.equalTo(ConversationModel.c.id))
            .order(aliased.c.createdAt.desc())
            .limit(1).subquery("lastMessage")
        )
        const raw = new RawSQL("concat('Hola', 'Mundo')").label("quantity")

        const query = ConversationModel.query.select(...[...Object.values(ConversationModel.c), subquery, raw ] )
        const sql =  query.getSQL()
        const result = await query.fetchAllQuery()
        // console.log(sql)
        console.log({ sql, result })
        return res.json({ sql, result })
        res.send("its ok!")
    })
    
    
export default testRouter