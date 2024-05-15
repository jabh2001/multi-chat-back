import { Router } from "express";
import { errorResponse } from "../../service/errorService";
import { verifyUser } from "../../service/agentService";
import { assignJWTTokenToCookies, createJWTToken, getJWTTokenValue, isAuthenticatedMiddleware, removeJWTTokenCookie } from "../../service/authService";

const authRouter = Router()

authRouter.post("/login", async (req, res)=>{
    try{
        const { email, password } = req.body
        if(!email || !password) return res.status(401).json({ error: 'Email and Password are required' })
        const user = await verifyUser(email, password)
        if (!user) return res.status(403).json("Invalid Email or Password")
        //Create JWT token
        const token = createJWTToken(user.id)
        return assignJWTTokenToCookies(res, token).send({ user, token })
    } catch (e){
        return errorResponse(res, e)
    }
})
authRouter.post("/logout", async (req, res)=>{
    try{
        return removeJWTTokenCookie(res).send({ msg:"session out", status:true })
    } catch (e){
        return errorResponse(res, e)
    }
})
export default authRouter