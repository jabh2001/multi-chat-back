import { Router } from "express";

const qrRouter = Router()

qrRouter.ws('/qr',(ws,rq)=>{
    console.log('se creo el socket')
})
