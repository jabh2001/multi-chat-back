import express from "express";
import * as core from "express-serve-static-core";
import { ServerSentEventClient } from "./ServerSentEventClient";

export type Application = express.Application & WithSseMethod;
export type Router = express.Router & WithSseMethod;
export interface RouterLike {
    get: express.IRouterMatcher<this>;
    [key: string]: any;
    [key: number]: any;
}

export type SSERequestHandler = (sse: ServerSentEventClient, req: express.Request, next: express.NextFunction) => void;
export type sseMethod<T> = (route: core.PathParams, ...middlewares: SSERequestHandler[]) => T;

interface WithSseMethod {
    sse: sseMethod<this>;
}