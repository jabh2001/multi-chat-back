import { AgentType } from "../types";

const agents:AgentType[] = [
    { id: 1, name: "Jhonder Bastidas", role: "admin", email: "jhonder@example.com", teams:[] },
    { id: 2, name: "Reina", role: "agent", email: "reina@example.com", teams:[] },
    { id: 3, name: "John Doe", role: "agent", email: "john@example.com", teams:[] },
    { id: 4, name: "Jane Smith", role: "agent", email: "jane@example.com", teams:[] }
]

export const getTeams:GetAgentsType = async () => {
    return new Promise((resolve) => resolve(agents));
}

export const saveNewAgent:SaveNewAgentType = async (newAgent) => {
    const agentWithId = { ...newAgent, id: Math.max(...agents.map(t=>t.id)) + 1 };
    agents.push(agentWithId);
    return new Promise((resolve) => resolve(agentWithId))
}
export const getAgentById:GetAgentByIdType = async (id) => {
    const index = agents.findIndex(t => t.id === id);
    if (index !== -1){
        return new Promise((resolve)=>resolve(agents[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Agent not found"}))
}
export const updateAgent:UpdateAgentType = async (agent, newData) => {
    const index = agents.findIndex(t => t.id === agent.id);
    if (index !== -1){
        agents[index] = { ...agents[index], ...newData}
        return new Promise((resolve)=>resolve(agents[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Agent not found"}))
}
export const deleteAgent:DeleteAgentType = async (agent) => {
    const index = agents.findIndex(t => t.id === agent.id);
    if (index !== -1){
        const [agent] = agents.splice(index, 1)
        return new Promise((resolve)=>resolve(agent));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Team not found"}))
}

type GetAgentsType = () => Promise<AgentType[]>
type SaveNewAgentType = (newAgent:Omit<AgentType, "id">) => Promise<AgentType>
type GetAgentByIdType = (id:AgentType["id"]) => Promise<AgentType>
type UpdateAgentType = (id:AgentType, newData:Partial<AgentType>) => Promise<AgentType>
type DeleteAgentType = (id:AgentType) => Promise<AgentType>