import * as express from "express"
import { ServerSentEventList } from "./ServerSentEventServer"
import { Application, RouterLike, type Router as RouterType, Router } from "./types"
import addSseMethod from "./addSseMethod"

export default function expressSse(app:express.Application, ){
    const clientList = new ServerSentEventList()
    
    addSseMethod(app, clientList)
    return {
        app:app as Application,
        getClientList:()=>clientList,
        SSERouter:() =>{
            const router = express.Router() as any
            addSseMethod(router, clientList)
            return router as RouterType
        }
    }
}