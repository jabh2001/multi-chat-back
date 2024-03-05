import express from "express"
import cors from "cors"
import apiRouter from "./routers/api"
import { TeamModel } from "./libs/models"

const app = express()
const port = 3000
const carpetas = 'carpetas.json';

app.use(express.json())
app.use(cors({ origin:"http://localhost:5173", credentials:true}))

app.use("/api", apiRouter)

app.get("/", async (req, res)=>{
    const insert = TeamModel.insert.values({ name:"hola"}, { name:"Hello"}).getSQL()
    const update = TeamModel.update.values({ name:"hola", description:"asd"}).filter(TeamModel.c.id.equalTo(1), TeamModel.c.name.lessThan(1)).getSQL()
    res.json({
        insert,
        update
    })
})


app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))