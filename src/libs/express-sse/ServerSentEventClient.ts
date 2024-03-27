import EventEmitter from "events";
import { Request, Response } from "express";
import { MultiChatEventMap, MultiChatEventName } from "../SSEventHandle/Events";
const HEADERS = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
}

export class ServerSentEventClient extends EventEmitter {
    private _request: Request
    private _response: Response
    get req() { return this._request }
    get res() { return this._response }

    constructor(req: Request, res: Response) {
        super()
        this._request = req
        this._response = res
        this.init()
    }

    init() {
        this.res.writeHead(200, HEADERS);
        this.sendMessage("HelloConnection")
        this.req.on('close', () => {
            this.emitClose()
            this.res.end()
        });
    }

    emitClose(){
        this.emit("close");
    }

    send(eventName: string, data: string) {
        this.res.write(`event: ${eventName}\ndata: ${data}\n\n`)
    }

    sendMessage(msg: string) {
        this.send("message", msg)
    }
    emit<EventName extends MultiChatEventName>(eventName: EventName, arg?:MultiChatEventMap[EventName]): boolean {
        this.send(eventName, JSON.stringify(arg))
        return super.emit(eventName, arg);
    }
    on<EventName extends MultiChatEventName>(eventName: EventName, listener: (args: MultiChatEventMap[EventName]) => void): this {
        return super.on(eventName, listener);
    }
}