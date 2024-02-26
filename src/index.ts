import express from "express"
import cors from "cors"

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.get("/", (req, res)=>{
    res.json({ hello:"world"})
})

app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))