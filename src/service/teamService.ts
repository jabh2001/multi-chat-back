import { TeamModel } from "../libs/models";
import { TeamType } from "../types";

export const getTeams:GetTeamsType = async () => {
    const teams = await TeamModel.repository.findAll()
    return teams;
}

export const saveNewTeam:SaveNewTeamType = async (newTeam) => {
    const team = await TeamModel.repository.insert({ ...newTeam })
    return team
}
export const getTeamById:GetTeamByIdType = async (id) => {
    return await TeamModel.repository.findById(id)
}
export const updateTeam:UpdateTeamType = async (id, newData) => {
    return await TeamModel.repository.update(id, newData)
}

export const deleteTeam:DeleteTeamType = async (id) => {
    return await TeamModel.repository.delete(id)
}

type GetTeamsType = () => Promise<TeamType[]>
type SaveNewTeamType = (newTeam:Omit<TeamType, "id">) => Promise<TeamType>
type GetTeamByIdType = (id:TeamType["id"]) => Promise<TeamType>
type UpdateTeamType = (id:TeamType["id"], newData:Partial<TeamType>) => Promise<TeamType>
type DeleteTeamType = (id:TeamType["id"]) => Promise<TeamType>