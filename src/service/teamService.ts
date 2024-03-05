import { TeamModel } from "../libs/models";
import { TeamType } from "../types";

export const getTeams:GetTeamsType = async () => {
    const teams = await TeamModel.query.fetchAllQuery<TeamType>()
    return teams;
}

export const saveNewTeam:SaveNewTeamType = async (newTeam) => {
    const team = await TeamModel.insert.values({ ...newTeam }).fetchOneQuery<TeamType>()
    return team
}
export const getTeamById:GetTeamByIdType = async (id) => {
    return await TeamModel.query.filter(TeamModel.c.id.equalTo(id)).fetchOneQuery<TeamType>()
}
export const updateTeam:UpdateTeamType = async (id, newData) => {
    return await TeamModel.update.values(newData).filter(TeamModel.c.id.equalTo(id)).fetchOneQuery<TeamType>()
}

export const deleteTeam:DeleteTeamType = async (id) => {
    return await TeamModel.delete.filter(TeamModel.c.id.equalTo(id)).fetchOneQuery<TeamType>()
}

type GetTeamsType = () => Promise<TeamType[]>
type SaveNewTeamType = (newTeam:Omit<TeamType, "id">) => Promise<TeamType>
type GetTeamByIdType = (id:TeamType["id"]) => Promise<TeamType>
type UpdateTeamType = (id:TeamType["id"], newData:Partial<TeamType>) => Promise<TeamType>
type DeleteTeamType = (id:TeamType["id"]) => Promise<TeamType>