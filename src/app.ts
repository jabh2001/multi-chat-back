import express from "express"
import expressWs from "express-ws";
const { getWss, applyTo, app } = expressWs(express());

export {
    getWss,
    applyTo,
    app
}