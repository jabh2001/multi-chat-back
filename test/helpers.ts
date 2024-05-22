import {app, server} from "../src";
import { agent } from "supertest"
import client from "../src/libs/dataBase";
import { verifyOrCreateAdminUser } from "../src/service/agentService";

const SUPER_AUTH_ADMIN_TOKEN = process.env.SUPER_AUTH_ADMIN_TOKEN as string

const api = agent(app)
api.set({ "x-auth-admin-token": SUPER_AUTH_ADMIN_TOKEN})

export { api }
export const beforeAllFunc = async () => {
    try {
        await client.query("select 1")
    } catch (e){
        await client.connect()
    } finally {
        await verifyOrCreateAdminUser()
    }
}
export const teardownServer = async () => {
    server.close()
    await client.end()
}
