import { applyTo } from "../app";
import { Router } from "express";

const messageWsRouter = Router()

messageWsRouter.ws('/conversation/:id',async(ws, rq)=>{
    ws.onmessage= ()=>{
        
    }
})

applyTo(messageWsRouter)