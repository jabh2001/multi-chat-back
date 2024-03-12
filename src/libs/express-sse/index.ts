import * as express from "express"
import { ServerSentEventList } from "./ServerSentEventServer"
import { Application, RouterLike } from "./types"
import addSseMethod from "./addSseMethod"

export default function expressSse(app:express.Application, ){
    const clientList = new ServerSentEventList()
    
    addSseMethod(app)
    return {
        app:app as Application,
        getClientList:()=>clientList,
        applyTo:(router:RouterLike) => {
            addSseMethod(router)
        }
    }
}
