import makeWASocket, { DisconnectReason, MessageUpsertType, SocketConfig, proto, useMultiFileAuthState } from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import pino from "pino"
import qrcode from "qrcode"
import fs from "fs"
import { MessageType } from "../types"

const QR_FOLDER="../QRs"
abstract class Socket {
    folder:string

    get qr_folder(){
        return `${QR_FOLDER}/${this.qr}`
    }
    get qr(){
        return `qr-${this.folder}.png`
    }

    async saveQRCode(qrData:string) {
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

    constructor (folder:string){
        this.folder = folder
    }
    abstract sendMessage(phone:string, message:MessageType): void
}
class WhatsAppBaileysSocket extends Socket{
    sock:any

    constructor (folder:string){
        super(folder)
        this.start()
    }
    async start(){
        const { state, saveCreds } = await useMultiFileAuthState(`sessions/${this.folder}`)
        const sock = makeWASocket({ auth:state, logger: pino({ level:"silent"}) })
        sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
            qr && this.saveQRCode(qr)
            if( connection == "close"){
                const reason = new Boom(lastDisconnect?.error).output.statusCode
                if (reason === DisconnectReason.badSession) {
                    console.log( `Bad Session File, Please Delete session_auth_info and Scan Again` );
                    sock.logout();
                } else if(reason === DisconnectReason.restartRequired){
                    this.start()
                }
            }
        })
        sock.ev.on("creds.update", saveCreds)
        sock.ev.on("messages.upsert", this.messageUpsert)
        this.sock = sock
    }

    async messageUpsert({ messages, type }:{ messages:proto.IWebMessageInfo[], type:MessageUpsertType}){
        console.log(JSON.stringify(messages, null, 4));
        this.sock.sendMessage(messages[0]?.key.remoteJid!, { text:"Hola!" })
    }

    async sendMessage(phone:string, message:MessageType){
        // to implementing
    }
}

class SocketPool {
    private static instance:SocketPool
    private pool:Map<string, Socket> = new Map()

    private constructor(){
        this.pool = new Map()
    }

    static getInstance(){
        if (!SocketPool.instance) {
            SocketPool.instance = new SocketPool();
        }
        return SocketPool.instance;
    }

    getConnection(folder:string){
        return this.pool.get(folder)
    }
    getBaileysConnection(folder:string){
        return this.pool.get(folder) as WhatsAppBaileysSocket | undefined
    }

    createBaileysConnection(folder:string){
        let socket = new WhatsAppBaileysSocket(folder);
        this.pool.set(folder, socket);
        return socket
    }
}