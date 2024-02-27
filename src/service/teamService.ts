import { TeamType } from "../types";

const teams:TeamType[] = [
    { id: 1, name: 'Desarrollo', description: 'Equipo encargado del desarrollo de software.' },
    { id: 2, name: 'Marketing', description: 'Equipo encargado de las estrategias de marketing y publicidad.' },
    { id: 3, name: 'Soporte Técnico', description: 'Equipo de atención al cliente y soporte técnico.' }
]

export const getTeams:GetTeamsType = async () => {
    return new Promise((resolve) => resolve(teams));
}

export const saveNewTeam:SaveNewTeamType = async (newTeam) => {
    const teamWithId = { ...newTeam, id: Math.max(...teams.map(t=>t.id)) + 1 };
    teams.push(teamWithId);
    return new Promise((resolve) => resolve(teamWithId))
}
export const getTeamById:GetTeamByIdType = async (id) => {
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1){
        return new Promise((resolve)=>resolve(teams[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Team not found"}))
}
export const updateTeam:UpdateTeamType = async (id, newData) => {
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1){
        teams[index] = { ...teams[index], ...newData}
        return new Promise((resolve)=>resolve(teams[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Team not found"}))
}
export const deleteTeam:DeleteTeamType = async (id) => {
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1){
        const [team] = teams.splice(index, 1)
        return new Promise((resolve)=>resolve(team));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Team not found"}))
}

type GetTeamsType = () => Promise<TeamType[]>
type SaveNewTeamType = (newTeam:Omit<TeamType, "id">) => Promise<TeamType>
type GetTeamByIdType = (id:TeamType["id"]) => Promise<TeamType>
type UpdateTeamType = (id:TeamType["id"], newData:Partial<TeamType>) => Promise<TeamType>
type DeleteTeamType = (id:TeamType["id"]) => Promise<TeamType>