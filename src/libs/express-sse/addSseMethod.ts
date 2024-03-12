import { ServerSentEventClient } from "./ServerSentEventClient";
import { RouterLike, SSERequestHandler } from "./types";
import wrapMiddleware from "./wrapMiddleware";

export default function addSseMethod(target: RouterLike){
    if (target.sse === null || target.sse === undefined) {
      target.sse = function addWsRoute(route:string, ...middlewares:SSERequestHandler[]) {
        const wrappedMiddlewares = middlewares.map(wrapMiddleware);
        this.get(route,(req, res, next)=>{
          // req.sse = new ServerSentEventClient
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