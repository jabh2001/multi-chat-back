import { Router } from "express";

const qrRouter = Router()

qrRouter.ws('/qr',(ws,rq)=>{
    console.log('s  e creo el socket')
})
