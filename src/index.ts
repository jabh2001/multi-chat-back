import express from "express"
import cors from "cors"
import apiRouter from "./routers/api"
import { createTables } from "./libs/dataBase"

const app = express()
const port = 3000
const carpetas = 'carpetas.json';

createTables()
app.use(express.json())
app.use(cors({ origin:"http://localhost:5173", credentials:true}))

app.use("/api", apiRouter)

app.get("/", async (req, res)=>{
    res.send("html")
})


app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))