import { Router } from "express"
import { getContactAvatar } from "../service/fileService";

const imageRouter = Router()

imageRouter.get("/contact/:id", async (req, res )=>{
    try{
        var data = await getContactAvatar(req.params.id);
        var img = Buffer.from(data, 'base64');
    
       res.writeHead(200, {
         'Content-Type': 'image/png',
         'Content-Length': img.length
       });
       res.end(img); 
    } catch (e){
        res.status(404).send("Image not found")
    }
})

export default imageRouter