import { Response } from "express"
import { ZodError } from "zod"

export function errorResponse(res:Response, e:any){
    if(e instanceof ZodError){
        return res.status(400).json({ errors: e.errors.map(e => ({ field:e.path.join("."), message:e.message }) ) })
    }
    return res.status(500).json({ errors: [e.message] })
}