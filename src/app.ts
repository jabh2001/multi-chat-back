import express from "express"
import expressWs from "express-ws";
import expressSse from "./libs/express-sse";
const { getWss, applyTo, app } = expressWs(express());
const { getClientList, applyTo:convertSSE} = expressSse(app)

export {
    getWss,
    applyTo,
    getClientList,
    convertSSE,
    app
}