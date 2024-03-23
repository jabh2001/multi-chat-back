import makeWASocket, { DisconnectReason, MessageUpsertType, downloadMediaMessage, proto, useMultiFileAuthState } from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import pino from "pino"
import qrcode from "qrcode"
import fs from "fs"
import { ContactType, ConversationType, InboxType, Base64Buffer } from "../types"
import { MessageType } from "./schemas"
import { ContactModel, ConversationModel, InboxModel } from "./models"
import path from "path"
import { getClientList, getWss } from "../app"
import "./dataBase"
import WS from "./websocket"
import { getMessageByWhatsAppId } from "../service/messageService"
import { Join } from "./orm/query"


const sseClients = getClientList()
const QR_FOLDER = "./QRs"
const SESSION_FOLDER = "./sessions"

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
                const shouldLogout = reason !== DisconnectReason.connectionClosed

                if (shouldReconnect) {
                    await this.start()
                } else if (shouldLogout) {
                    console.log("logout")
                    await this.logout()
                }
            } else if (connection === "open") {
                this.sentCreds()
            }
        })
        sock.ev.on("creds.update", async () => await Promise.all([saveCreds(), this.sentCreds()]))
        sock.ev.on("messages.upsert", evt => this.messageUpsert(evt))
        this.sock = sock

    }
    sentCreds() {
        sseClients.emitToClients("qr-update", { name: this.folder, user: this.sock?.user ?? false, qr: this.getQRBase64() })
    }

    async verifyStatus(logout = false) {
        try {
            if (!this.sock.user) return false
            await this.sock.sendPresenceUpdate("available")
            return true
        } catch (e) {
            if (e instanceof Boom && e.output.statusCode == DisconnectReason.connectionClosed) {
                if (logout) {
                    await this.logout()
                }
                return false
            } else {
                console.log("Verify error")
                console.log({ e })
            }
        }
    }
    async logout() {
        const carpetaSesion = path.join(SESSION_FOLDER, this.folder);

        // Verificar si la carpeta existe
        if (fs.existsSync(carpetaSesion)) {
            // Eliminar la carpeta
            console.log("logout " + carpetaSesion);
            this.sock = undefined
            fs.rmdir(carpetaSesion, { recursive: true }, (err) => {
                console.log("in logout " + carpetaSesion);
                if (err) {
                    console.error('Error al eliminar la carpeta:', err);
                } else {
                    console.log('Carpeta eliminada correctamente');

                    this.start().then(() => this.sentCreds()).then(() => this.sock?.ev?.flush())

                }
            });
        }
    }


    async messageUpsert({ messages, type }: { messages: proto.IWebMessageInfo[], type: MessageUpsertType }) {
        const wss = getWss()
        const MEDIAMESSAGE = ['audioMessage', 'imageMessage', 'videoMessage', 'documentMessage']
        messages.forEach(async (m) => {
            if (!m.message) return
            console.log(m.message)
            let base64Buffer: null | Base64Buffer = null
            if (MEDIAMESSAGE.includes(Object.keys(m.message)[0])) {
                try {
                    const buffer = await downloadMediaMessage(
                        m,
                        'buffer',
                        {},
                        {
                            logger: this.sock.logger,
                            reuploadRequest: this.sock.updateMediaMessage
                        }
                    );
                    base64Buffer = {
                        base64: buffer.toString('base64'),
                        tipo: Object.keys(m.message)[0]
                    }
                    console.log(base64Buffer)
                } catch (error) {
                    console.error('Error al descargar el medio:', error);
                }
            }

            const phoneNumber = '+' + m.key.remoteJid?.split('@')[0]
            const text = m.message?.conversation || m.message?.extendedTextMessage?.text
            const joinResult = (
                await ContactModel.query
                    .join(ContactModel.r.conversations, Join.INNER)
                    .join(InboxModel, ConversationModel.c.inboxId, InboxModel.c.id)
                    .filter(ContactModel.c.phoneNumber.equalTo(phoneNumber), InboxModel.c.name.equalTo(this.folder))
                    .fetchAllQuery<ContactType & { conversation: ConversationType, inbox: InboxType }>()
            )
            if (joinResult.length == 0) {
                return
            }
            const result = joinResult[0];
            const conversationID = result.conversation.id
            const fromMe = m.key.fromMe === true;

            // if (result) {
            //     for (const ws of wss.clients) {
            //         ws.emit('message-upsert' + conversationID, { ...result, text, fromMe, messageID: m.key.id, base64Buffer });
            //    }}
            if (result && m.key.id) {
                
                const data = { ...result, text, fromMe, messageID: m.key.id, base64Buffer }
                let message
                if (fromMe) {
                    const res = await getMessageByWhatsAppId(m.key.id)
                    console.log(res, res.length)
                    if (res.length == 0) {
                        message = await WS.outgoingMessageFromWS(data)
                    }
                } else {
                    message = await WS.incomingMessage(data)
                }
                if (message) {
                    for (const ws of wss.clients) {
                        ws.emit('message-upsert' + conversationID, message);
                    }
                }
            } else {

                console.log(result, m.key.id)
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
                conn.sentCreds()
            })
        }
        setInterval(() => {
            this.pool.forEach(async (v, k) => {
                if (v instanceof WhatsAppBaileysSocket) {
                    await v.verifyStatus()
                }
            })
        }, 10000)
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