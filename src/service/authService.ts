import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getAgentAndTeams, getAgentById, verifyUser } from "./agentService";

const secret = process.env.JWT_SECRET_KEY as string
const SUPER_AUTH_ADMIN_TOKEN = process.env.SUPER_AUTH_ADMIN_TOKEN as string
const USER_ADMIN_PASSWORD = process.env.USER_ADMIN_PASSWORD as string
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
    return res.cookie(JWTCookieName, token, { maxAge, httpOnly:true, secure:true, sameSite:"none" })
}

export function removeJWTTokenCookie(res:Response){
    return res.clearCookie(JWTCookieName, { secure:true, sameSite:"none" })
}

export const isAuthenticatedMiddleware = async (req:Request, res:Response, next:NextFunction) =>{
    let token
    if(req.headers.authorization){
        token = req.headers.authorization.split(' ')[1]
    } else if( req.cookies[JWTCookieName] ) {
        token = req.cookies[JWTCookieName]
    } else if (req.header('x-auth-admin-token') && req.header('x-auth-admin-token') === SUPER_AUTH_ADMIN_TOKEN) {
        const user = await verifyUser("admin@admin.com", USER_ADMIN_PASSWORD)
        token = createJWTToken(user.id)
    }else {
        res.status(401).json({ message : "You are not authenticated!" })
        return
    }
    
    let jwt = getJWTTokenValue(token) as any
    if(!jwt) return res.status(401).json({ message : "You are not authenticated!" })
    const { userId } = jwt
    try{
        req.identity = await getAgentAndTeams(userId)
        token = createJWTToken(req.identity.id)
        assignJWTTokenToCookies(res, token)
        next()
    } catch(e){
        res.status(401).json({ message : "Your token is invalid" })
        return
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