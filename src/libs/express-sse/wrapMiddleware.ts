import express, { Router } from "express"
import { SSERequestHandler } from "./types";


export default function wrapMiddleware(middleware:SSERequestHandler):express.Handler {
    return (req:any, res, next) => {
      if (req.sse !== null && req.sse !== undefined) {
        req.wsHandled = true;
        try {
          middleware(req.sse, req, next);
        } catch (err) {
          next(err);
        }
      } else {
        /* This wasn't a WebSocket request, so skip this middleware. */
        next();
      }
    };
  }