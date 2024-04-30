import { Router } from "express";
import { getAllFastMessage } from "../../service/fastMessageService";

const fastRouter = Router()

fastRouter.get('/', (rq,res)=>{
    const messages = getAllFastMessage()
    res.json(messages)
})

fastRouter.post('/', (rq, rs)=>{
    postMessage(rq.body)
    rs.json(rq.body)
    
})