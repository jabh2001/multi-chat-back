import 'dotenv/config';
import express from "express"
import cors from "cors"
import apiRouter from "./routers/api"
import cookieParser from "cookie-parser"
import SocketPool from './libs/socketConnectionPool';
import { app } from './app';
import qrRouter from './service/qrRouter';
import messageWsRouter from './service/messageRouter';
SocketPool.getInstance()


app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin:"http://localhost:5173", credentials:true}))

app.use("/api", apiRouter)
app.use('/ws',messageWsRouter)

app.get("/", async (req, res)=>{
    res.send("html")
})


const port = 3000
app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))