import express from "express"

const app = express()
const port = 3000

app.get("/", (req, res)=>{
    res.json({ hello:"world"})
})

app.listen(port, ()=> console.log(`This express server is now running on port: ${port}`))