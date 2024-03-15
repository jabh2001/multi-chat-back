import makeWASocket, { DisconnectReason, MessageUpsertType, SocketConfig, proto, useMultiFileAuthState } from "@whiskeysockets/baileys"
import EventEmitter from "events"
import { Boom } from "@hapi/boom"
import pino from "pino"
import qrcode from "qrcode"
import fs from "fs"
import { InboxType } from "../types"
import { MessageType } from "./schemas"
import { ContactModel, ConversationModel, InboxModel } from "./models"
import path from "path"
import { getClientList, getWss } from "../app"
import { any, object } from "zod"


const QR_FOLDER = "./QRs"
abstract class Socket {
    folder: string

    get qr_folder() {
        return path.join(QR_FOLDER, this.qr)
    }
    get qr() {
        return `qr-${this.folder}.png`
    }
    getQRBase64() {
        const base64 = fs.readFileSync(this.qr_folder, { encoding: 'base64' });
        return base64
    }

    async saveQRCode(qrData: string) {
        try {
            const qrCodeDataUrl = await qrcode.toDataURL(qrData, { errorCorrectionLevel: 'H' });
            const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
            if (!fs.existsSync(QR_FOLDER)) {
                fs.mkdirSync(QR_FOLDER);
            }
            fs.writeFileSync(this.qr_folder, base64Data, 'base64');
        } catch (error) {
            console.error('Error al guardar el código QR:', error);
        }
    }

    constructor(folder: string) {
        this.folder = folder
    }
    abstract sendMessage(phone: string, message: MessageType): void
}
class WhatsAppBaileysSocket extends Socket {
    sock: any

    constructor(folder: string) {
        super(folder)
        this.start()
    }
    async start() {
        const { state, saveCreds } = await useMultiFileAuthState(`sessions/${this.folder}`)
        const sock = makeWASocket({ auth: state, logger: pino({ level: "silent" }) })

        sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
            qr && this.saveQRCode(qr)
            if (connection === "close") {
                const reason = new Boom(lastDisconnect?.error).output.statusCode
                const shouldReconnect = reason !== DisconnectReason.loggedOut

                if (shouldReconnect) {
                    await this.start()
                }
            }
        })
        sock.ev.on("creds.update", saveCreds)
        sock.ev.on("messages.upsert", this.messageUpsert)
        this.sock = sock
    }

    async messageUpsert({ messages, type }: { messages: proto.IWebMessageInfo[], type: MessageUpsertType }) {
        const wss = getWss()
        messages.forEach(async (m) => {
            const phoneNumber ='+'+m.key.remoteJid?.split('@')[0]
            const text = m.message?.conversation||m.message?.extendedTextMessage?.text
            if (m.key.fromMe == true) {
            } else {
                const joinResult = await ContactModel.query.join(
                    ConversationModel,
                    ConversationModel.c.senderId,
                    ContactModel.c.id
                ).fetchAllQuery()
                const result = joinResult.find((obj: any) => obj.phoneNumber === phoneNumber)
                if (result) {
                    const data ={
                        result, text
                    }
                    for (const ws of wss.clients) {
                        ws.emit('mensajeRecibido', { ...result, text })
                    }

                }
            }
        })

    }

    async sendMessage(phone: string, message: MessageType) {
        const mensaje = {
            text: message.content
        };

        return await this.sock.sendMessage(`${phone}@s.whatsapp.net`, mensaje);
    }


}

class SocketPool {
    private static instance: SocketPool
    private pool: Map<string, any> = new Map()

    private constructor() {
        this.pool = new Map()
        this.init()
    }

    async init() {
        const inboxes = await InboxModel.query.fetchAllQuery<InboxType>()
        for (const inbox of inboxes) {
            const conn = this.createBaileysConnection(inbox.name)
            const watch = fs.watch(conn.qr_folder)
            watch.on("change", () => {
                const sseClients = getClientList()
                sseClients.sendToClients("qr-update", JSON.stringify({ name: inbox.name, qr: conn.getQRBase64(), user: conn.sock.user }))
            })
        }
    }

    static getInstance() {
        if (!SocketPool.instance) {
            SocketPool.instance = new SocketPool();
        }
        return SocketPool.instance;
    }

    getConnection(folder: string) {
        return this.pool.get(folder)
    }
    getBaileysConnection(folder: string) {
        return this.pool.get(folder) as WhatsAppBaileysSocket | undefined
    }

    createBaileysConnection(folder: string) {
        let socket = new WhatsAppBaileysSocket(folder);
        this.pool.set(folder, socket);
        return socket
    }
    getOrCreateBaileysConnection(folder: string): WhatsAppBaileysSocket {
        const connection = this.getBaileysConnection(folder)
        if (connection) {
            return connection
        } else {
            return this.createBaileysConnection(folder)
        }
    }
}

export default SocketPool