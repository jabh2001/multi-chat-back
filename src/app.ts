import express from "express"
import expressWs from "express-ws";
import expressSse from "./libs/express-sse";
const { getWss, applyTo, app } = expressWs(express());
const { getClientList, SSERouter} = expressSse(app)

export {
    getWss,
    applyTo,
    getClientList,
    SSERouter,
    app
}