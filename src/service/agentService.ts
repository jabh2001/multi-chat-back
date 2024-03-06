import { TeamModel, UserModel, UserTeamModel } from "../libs/models";
import { AgentType, TeamType, UserType } from "../types";

export const getAgents:GetAgentsType = async () => {
    return await UserModel.query.fetchAllQuery()
}

export const saveNewAgent:SaveNewAgentType = async (newAgent) => {
    return await UserModel.insert.value(newAgent).fetchOneQuery()
}
export const getAgentById:GetAgentByIdType = async (id) => {
    return await UserModel.query.filter(UserModel.c.id.equalTo(id)).fetchOneQuery()
}

export const updateAgent:UpdateAgentType = async (agent, newData) => {
    return await UserModel.update.values(newData).filter(UserModel.c.id.equalTo(agent.id)).fetchOneQuery()
}

export const deleteAgent:DeleteAgentType = async (agent) => {
    return await UserModel.delete.filter(UserModel.c.id.equalTo(agent.id)).fetchOneQuery()
}

export const getAgentTeams:getAgentTeamsType = async (agent) => {
    return await TeamModel.query.join(UserTeamModel, UserTeamModel.c.teamId).filter(UserTeamModel.c.userId.equalTo(agent.id)).fetchAllQuery()
}

export const updateAgentTeams:UpdateAgentTeamsType = async (agent, teams)=>{
    await UserTeamModel.delete.filter(UserTeamModel.c.userId.equalTo(agent.id)).fetchAllQuery()
    const values = teams.map(t => ({ userId:agent.id, teamId:t }))
    await UserTeamModel.insert.values(...values).fetchAllQuery()
    return await getAgentTeams(agent)
}


type GetAgentsType = () => Promise<AgentType[]>
type SaveNewAgentType = (newAgent:Omit<AgentType, "id">) => Promise<AgentType>
type GetAgentByIdType = (id:AgentType["id"]) => Promise<AgentType>
type UpdateAgentType = (id:AgentType, newData:Partial<AgentType>) => Promise<AgentType>
type DeleteAgentType = (id:AgentType) => Promise<AgentType>
type getAgentTeamsType = (agent:UserType) => Promise<TeamType[]>
type UpdateAgentTeamsType = (agent:UserType, teams:TeamType["id"][]) => Promise<TeamType[]>