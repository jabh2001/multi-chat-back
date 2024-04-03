import { getClientList } from "../app";
import { TeamModel, UserModel, UserTeamModel } from "../libs/models";
import { Join } from "../libs/orm/query";
import { userSchema } from "../libs/schemas";
import { AgentType, TeamType, UserType } from "../types";
import bcrypt from "bcrypt"
const sseClients = getClientList()
const salt = 10

export const getAgents:GetAgentsType = async () => {
    const users = await UserModel.query.fetchAllQuery()
    
    return users.map(u => userSchema.omit({ password:true }).parse(u)) as any
}

export const saveNewAgent:SaveNewAgentType = async (newAgent) => {
    const newData = userSchema.omit({ id:true }).parse(newAgent)
    const agent = await UserModel.insert.value({ ...newData, password:await bcrypt.hash(newData.password, salt) }).fetchOneQuery<AgentType>()
    sseClients.emitToClients("insert-agent", agent)
    return agent
}
export const getAgentById:GetAgentByIdType = async (id) => {
    const user = await UserModel.query.filter(UserModel.c.id.equalTo(id)).fetchOneQuery()
    return userSchema.omit({ password:true }).parse(user) as any
}

export const updateAgent:UpdateAgentType = async (agent, newAgent) => {
    const newData = userSchema.omit({ id:true }).partial().parse(newAgent)
    const user = await UserModel.update.values(newData).filter(UserModel.c.id.equalTo(agent.id)).fetchOneQuery()
    const parserUser =  userSchema.omit({ password:true }).parse(user)
    sseClients.emitToClients("update-agent", parserUser)
    return parserUser as any

}

export const deleteAgent:DeleteAgentType = async (agent) => {
    const deleted =  await UserModel.delete.filter(UserModel.c.id.equalTo(agent.id)).fetchOneQuery<AgentType>()
    sseClients.emitToClients("delete-agent", [deleted.id])
    return deleted
}

export const getAgentTeams:getAgentTeamsType = async (agent) => {
    return await TeamModel.query.join(UserTeamModel, UserTeamModel.c.teamId, TeamModel.c.id, Join.INNER).filter(UserTeamModel.c.userId.equalTo(agent.id)).fetchAllQuery()
}

export const updateAgentTeams:UpdateAgentTeamsType = async (agent, teams)=>{
    await UserTeamModel.delete.filter(UserTeamModel.c.userId.equalTo(agent.id)).execute()
    const values = teams.map(t => ({ userId:agent.id, teamId:t }))
    await UserTeamModel.insert.values(...values).fetchAllQuery()
    return await getAgentTeams(agent)
}

export const verifyUser = async (email:string, password:string) => {
    console.log({email, password})
    const res = await UserModel.query.filter(UserModel.c.email.equalTo(email)).fetchAllQuery()
    if(!res.length){
        throw new Error("Email or password incorrect")
    }
    console.log('no entro')
    const [ user, _] = res as any
    if (!await bcrypt.compare(password, user.password)){
        console.log('entró')
        
        console.log(await bcrypt.hash(password,10), user.password)
        throw new Error("Email or password incorrect")
    }
    // Remove password before sending back to client
    return userSchema.omit({ password:true }).parse(user)
}

type GetAgentsType = () => Promise<AgentType[]>
type SaveNewAgentType = (newAgent:Omit<AgentType, "id">) => Promise<AgentType>
type GetAgentByIdType = (id:AgentType["id"]) => Promise<AgentType>
type UpdateAgentType = (id:AgentType, newData:Partial<AgentType>) => Promise<AgentType>
type DeleteAgentType = (id:AgentType) => Promise<AgentType>
type getAgentTeamsType = (agent:UserType) => Promise<TeamType[]>
type UpdateAgentTeamsType = (agent:UserType, teams:TeamType["id"][]) => Promise<TeamType[]>