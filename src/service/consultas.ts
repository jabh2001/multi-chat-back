import connectToDatabase from "../libs/dataBase"

(async()=>{
    const cliente = await connectToDatabase()
    console.log(cliente)
})