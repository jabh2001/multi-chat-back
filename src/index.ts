import express,{Router} from "express"
import expressWs from 'express-ws'
import cors from "cors"
import apiRouter from "./routers/api"


const app = express()
const port = 3000
const carpetas = 'carpetas.json';

app.use(express.json())
app.use(cors({ origin:"http://localhost:5173", credentials:true}))

app.use("/api", apiRouter)

const { getWss, applyTo } = expressWs(app);
const qrRouter = Router()

qrRouter.ws('/qr',(ws,rq)=>{
    console.log('se creo el socket')
})


app.get("/", async (req, res)=>{
    res.send("html")
})
applyTo(qrRouter)
app.use('/ws',qrRouter)


app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))