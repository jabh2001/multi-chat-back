import { afterAll, beforeAll, beforeEach, describe, expect, test } from "@jest/globals"
import { ContactModel, LabelModel, TeamModel, UserModel } from "../src/libs/models"
import request, { agent } from "supertest"
import { app } from "../src"
import { api, beforeAllFunc, teardownServer } from "./helpers"
import { saveNewTeam } from "../src/service/teamService"
import { saveNewLabel } from "../src/service/labelService"
import { deleteAgent, saveNewAgent, verifyOrCreateAdminUser } from "../src/service/agentService"
import { saveNewContact } from "../src/service/contactService"

beforeAll(beforeAllFunc)

describe("index-route", () => {

    test("fetch a index route", async () => {
        const response = (
            await request(app).get("/")
            .expect(200)
            .expect("Content-Type", /text/)
        )
        expect(response.text).toEqual('html');
    })
})

describe("team-route", () => {
    const basePath = "/api/teams/"
    beforeEach(async () => {
        await TeamModel.fetchTeardownAllData()
        await saveNewTeam({ name:"Trabajo", description:"Etiqueta de trabajo"})
        await saveNewTeam({ name:"Estudio", description:"Etiquetas para estudio"})
        await saveNewTeam({ name:"Ventas", description:"Etiqueta para ventas"})
    })
    test("get-route", async () => {
        const res = await api.get(basePath)
        .expect(200)
        .expect("Content-Type", /application\/json/)

        let body = res.body
        expect(body).toHaveProperty("teams")
        expect(body.teams).toHaveLength(3)
        expect(body.teams[0]).toHaveProperty("name", "Trabajo")
        expect(body.teams[0]).toHaveProperty("id")
        
        const teams = body.teams
        const res2 = await api.get(basePath + body.teams[0].id)
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("team")
        expect(body.team).toEqual(teams[0])

        const res3 = await api.get(basePath + "-1")
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")
    })

    test("post-put-delete-route", async () => {
        const res = await api.post(basePath)
        .send({ name:"Trabajo 2", description:"Etiqueta de trabajo" })
        .expect(200)
        .expect("Content-Type", /application\/json/)
        let {body} = res
        expect(body).toHaveProperty("team")
        expect(body.team).toHaveProperty("id")
        expect(body.team).toHaveProperty("name", "Trabajo 2")

        const team = body.team
        const res2 = await api.put(basePath+team.id)
        .send({ name:"Trabajo editado"})
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("team")
        expect(body.team).toHaveProperty("id")
        expect(body.team.id).toEqual(team.id)
        expect(body.team.name).toEqual("Trabajo editado")
        await api.delete(basePath +team.id)
        .expect(200)

        const res3 = await api.get(basePath +team.id)
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")

    })
})

describe("label-route", () => {
    const basePath = "/api/labels/"
    beforeEach(async () => {
        await LabelModel.fetchTeardownAllData()
        await saveNewLabel({ name:"Trabajo", description:"Etiqueta de trabajo"})
        await saveNewLabel({ name:"Estudio", description:"Etiquetas para estudio"})
        await saveNewLabel({ name:"Ventas", description:"Etiqueta para ventas"})
    })
    test("get-route", async () => {
        const res = await api.get(basePath)
        .expect(200)
        .expect("Content-Type", /application\/json/)

        let body = res.body
        expect(body).toHaveProperty("labels")
        expect(body.labels).toHaveLength(3)
        expect(body.labels[0]).toHaveProperty("name", "Trabajo")
        expect(body.labels[0]).toHaveProperty("id")
        
        const labels = body.labels
        const res2 = await api.get(basePath + body.labels[0].id)
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("label")
        expect(body.label).toEqual(labels[0])

        const res3 = await api.get(basePath + "-1")
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")
    })

    test("post-put-delete-route", async () => {
        const res = await api.post(basePath)
        .send({ name:"Trabajo 2", description:"Etiqueta de trabajo" })
        .expect(200)
        .expect("Content-Type", /application\/json/)
        let {body} = res
        expect(body).toHaveProperty("label")
        expect(body.label).toHaveProperty("id")
        expect(body.label).toHaveProperty("name", "Trabajo 2")

        const label = body.label
        const res2 = await api.put(basePath+label.id)
        .send({ name:"Trabajo editado"})
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("label")
        expect(body.label).toHaveProperty("id")
        expect(body.label.id).toEqual(label.id)
        expect(body.label.name).toEqual("Trabajo editado")
        await api.delete(basePath +label.id)
        .expect(200)

        const res3 = await api.get(basePath +label.id)
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")

    })
})

describe("auth-route", () => {
    const basePath = "/api/"
    const fakeAgent = { id:0, name:"agent", email:"agent@test.com", password:"12345678", role:"agent" as "agent", teams:[]}
    beforeAll(async () => {
        const user = await saveNewAgent(fakeAgent)
        fakeAgent.id = user.id
    })
    afterAll(async () => {
        await deleteAgent(fakeAgent)
    })

    test("unauthorized", async () => {
        const  res = await request(app).get(basePath + "teams")
        .expect(401)
        .expect("Content-Type", /application\/json/)
        
        let {body} = res
        expect(body).toHaveProperty("message", "You are not authenticated!")
    })

    test("login", async () => {
        const  res = await request(app).post(basePath + "login").send(fakeAgent)
        .expect(200)
        .expect("Content-Type", /application\/json/)
        
        let {body} = res
        expect(body).toHaveProperty("token")
        expect(body).toHaveProperty("user")
        expect(body.user).toHaveProperty("name","agent")
        expect(body.user).toHaveProperty("email","agent@test.com")
        expect(body.user).toHaveProperty("role","agent")
    })
})

describe("agent-route", () => {
    const basePath = "/api/agents/"
    beforeEach(async () => {
        await UserModel.fetchTeardownAllData()
        await verifyOrCreateAdminUser()
        await saveNewAgent({ name:"Jhonder", email:"jhon@gmail.com", password:"123456789", role:"agent"} as any)
    })
    test("get-route", async () => {
        const res = await api.get(basePath)
        .expect(200)
        .expect("Content-Type", /application\/json/)

        let body = res.body
        expect(body).toHaveProperty("agents")
        expect(body.agents[0]).toHaveProperty("name", "admin")
        expect(body.agents[0]).toHaveProperty("id")
        
        const agents = body.agents
        const res2 = await api.get(basePath + body.agents[0].id)
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("agent")
        expect(body.agent).toEqual(agents[0])

        const res3 = await api.get(basePath + "-1")
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")
    })

    test("post-put-delete-route", async () => {
        const res = await api.post(basePath)
        .send({ name:"Jhonder2", email:"jhon2@gmail.com", password:"123456789", role:"agent"})
        .expect(200)
        .expect("Content-Type", /application\/json/)
        let {body} = res
        expect(body).toHaveProperty("agent")
        expect(body.agent).toHaveProperty("id")
        expect(body.agent).toHaveProperty("name", "Jhonder2")

        const agent = body.agent
        const res2 = await api.put(basePath+agent.id)
        .send({ name:"Trabajo editado"})
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("agent")
        expect(body.agent).toHaveProperty("id")
        expect(body.agent.id).toEqual(agent.id)
        expect(body.agent.name).toEqual("Trabajo editado")
        await api.delete(basePath +agent.id)
        .expect(200)

        const res3 = await api.get(basePath +agent.id)
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")

    })
})
describe("contact-route", () => {
    const basePath = "/api/contacts/"
    beforeEach(async () => {
        await ContactModel.fetchTeardownAllData()
        await saveNewContact({ name:"Jhonder", phoneNumber:"584121234567" })
    })
    test("get-route", async () => {
        const res = await api.get(basePath)
        .expect(200)
        .expect("Content-Type", /application\/json/)

        let body = res.body
        expect(body).toHaveProperty("contacts")
        expect(body.contacts[0]).toHaveProperty("name", "Jhonder")
        expect(body.contacts[0]).toHaveProperty("phoneNumber", "584121234567")
        expect(body.contacts[0]).toHaveProperty("id")
        
        const contacts = body.contacts
        const res2 = await api.get(basePath + body.contacts[0].id)
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("contact")
        // expect(body.contact).toEqual(contacts[0])

        const res3 = await api.get(basePath + "-1")
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")
    })

    test("post-put-delete-route", async () => {
        const res = await api.post(basePath)
        .send({ name:"Jhonder2", phoneNumber:"584141234567" })
        .expect(200)
        .expect("Content-Type", /application\/json/)
        let {body} = res
        expect(body).toHaveProperty("contact")
        expect(body.contact).toHaveProperty("id")
        expect(body.contact).toHaveProperty("name", "Jhonder2")
        expect(body.contact).toHaveProperty("phoneNumber", "584141234567")

        const contact = body.contact
        const res2 = await api.put(basePath+contact.id)
        .send({ name:"Trabajo editado", phoneNumber:"04161234567"})
        .expect(200)
        .expect("Content-Type", /application\/json/)
        body = res2.body
        expect(body).toHaveProperty("contact")
        expect(body.contact).toHaveProperty("id")
        expect(body.contact.id).toEqual(contact.id)
        expect(body.contact.name).toEqual("Trabajo editado")
        expect(body.contact.phoneNumber).toEqual("04161234567")
        await api.delete(basePath +contact.id)
        .expect(200)

        const res3 = await api.get(basePath +contact.id)
        .expect(404)
        .expect( "Content-Type", /application\/json/)

        body = res3.body
        expect(body).toHaveProperty("errors")
        expect(body.errors[0]).toHaveProperty("field")
        expect(body.errors[0]).toHaveProperty("message")

    })
})
afterAll(teardownServer)