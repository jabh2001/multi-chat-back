import EventEmitter from "events";
import { ServerSentEventClient } from "./ServerSentEventClient";

export class ServerSentEventList extends EventEmitter{
    clients:Set<ServerSentEventClient>

    constructor(){
        super()
        this.clients = new Set()
    }

    sendToClients(event:string, data:string){
        for (const client of this.clients) {
            client.send(event,data);
        }
    }

    emitToClients(event:string, ...args:any[]){
        for (const client of this.clients) {
            client.emit(event, args);
        }
    }

    registryNewClient(req:any, res:any){
        const newClient = new ServerSentEventClient(req, res)
        this.clients.add(newClient)
        newClient.on("close", () =>{
            this.clients.delete(newClient)
        })
        return newClient
    }
}