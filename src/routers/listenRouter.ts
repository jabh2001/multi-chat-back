import { SSERouter, getClientList } from "../app"

const listenRouter = SSERouter()

listenRouter.sse("/", async (sse)=>{
    
})

export default listenRouter