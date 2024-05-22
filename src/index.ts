import 'dotenv/config';
import express from "express"
import cors from "cors"
import apiRouter from "./routers/api"
import cookieParser from "cookie-parser"
import SocketPool from './libs/socketConnectionPool';
import { app } from './app';
import listenRouter from './routers/listenRouter';
import messageWsRouter from './routers/api/messageRouter';
import { isAuthenticatedMiddleware } from './service/authService';
import imageRouter from './routers/imageRouter';
SocketPool.getInstance()


app.use(express.json({ limit:"10mb"}))
app.use(cookieParser())
app.use(cors({ origin:"http://localhost:5173", credentials:true}))

app.use("/api", apiRouter)
app.use('/listen', isAuthenticatedMiddleware, listenRouter)
app.use('/ws',messageWsRouter)
app.use('/img', imageRouter)

app.get("/", async (req, res)=>{
    res.send("html")
})


const port = 3000
const server = app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))
export {
    server,
    app
}