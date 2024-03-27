import { ServerSentEventClient } from "./ServerSentEventClient";
import { ServerSentEventList } from "./ServerSentEventServer";
import { RouterLike, SSERequestHandler } from "./types";
import wrapMiddleware from "./wrapMiddleware";

export default function addSseMethod(target: RouterLike, clientList:ServerSentEventList){
    if (target.sse === null || target.sse === undefined) {
      target.sse = function addWsRoute(route:string, ...middlewares:SSERequestHandler[]) {
        const wrappedMiddlewares = middlewares.map(wrapMiddleware);
        this.get(route,(req, res, next)=>{
          req.sse = clientList.registryNewClient(req, res)
          next()
        }, ...wrappedMiddlewares);
        return this;
      };
    }
}
declare global {
    namespace Express {
      interface Request {
        sse:ServerSentEventClient
      }
    }
}