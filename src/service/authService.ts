import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getAgentById } from "./agentService";

const secret = process.env.JWT_SECRET_KEY as string
const JWTCookieName = "jwt"

const expiresIn = "1h"
const maxAge = 1000 * 60 * 60

export function createJWTToken(userId: any) {
    const token = jwt.sign({ userId }, secret, { expiresIn });
    return token
}

export function getJWTTokenValue(token: string) {
    try {
        if (!token) throw new Error('No authentication data provided')
        const value = jwt.verify(token, secret);
        return value;
    } catch (error: any) {
        console.log("Authentication error", error.message)
    }
}

export function assignJWTTokenToCookies(res:Response, token:string){
    return res.cookie(JWTCookieName, token, { maxAge, httpOnly:true, secure:true, sameSite:false })
}

export const isAuthenticatedMiddleware = async (req:Request, res:Response, next:NextFunction) =>{
    if(req.headers.authorization){
        let token = req.headers.authorization.split(' ')[1]
        let { userId } = getJWTTokenValue(token) as any
        req.identity = await getAgentById(userId)
        next()
    } else if( req.cookies[JWTCookieName] ) {
        let token = req.cookies[JWTCookieName]
        let { userId } = getJWTTokenValue(token) as any
        req.identity = await getAgentById(userId)
        next()
    } else {
        res.status(401).json({ message : "You are not authenticated!" })
    }
}
export const isAdminMiddleware = async (req:Request, res:Response, next:NextFunction) =>{
    if(req.headers.authorization){
        let token = req.headers.authorization.split(' ')[1]
        let { userId } = getJWTTokenValue(token) as any
        req.identity = await getAgentById(userId)
    } else if( req.cookies[JWTCookieName] ) {
        let token = req.cookies[JWTCookieName]
        let { userId } = getJWTTokenValue(token) as any
        req.identity = await getAgentById(userId)
    } else {
        res.status(401).json({ message : "You are not authenticated!" })
        return
    }
    if(!req.identity || req.identity?.role !== "admin" ){
        res.status(403).json({ message : "Protected function, you are not 'Admin'" })
    }
}