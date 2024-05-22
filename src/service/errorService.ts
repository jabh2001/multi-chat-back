import { Response } from "express"
import { ZodError } from "zod"
import { OneFetchNotFound } from "../libs/orm/query"

export function errorResponse(res:Response, e:any){
    if(e instanceof ZodError){
        const errors = e.errors.map(e => ({ field:e.path.join("."), message:e.message }) )
        console.log(errors)
        return res.status(400).json({ errors })
    } else if ( e instanceof OneFetchNotFound){
        return res.status(404).json({ errors:[{field:"fetch", message:"Source not found"}]})
    }
    return res.status(500).json({ errors: [e.message] })
}