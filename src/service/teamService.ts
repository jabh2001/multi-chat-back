import { getClientList } from "../app";
import { TeamModel } from "../libs/models";
import { teamSchema } from "../libs/schemas";
import { TeamType } from "../types";

const sseClients = getClientList()
export const getTeams:GetTeamsType = async () => {
    const teams = await TeamModel.query.fetchAllQuery<TeamType>()
    return teams;
}

export const saveNewTeam:SaveNewTeamType = async (newTeam) => {
    const newData = teamSchema.omit({ id:true }).parse(newTeam)
    const team = await TeamModel.insert.values(newData).fetchOneQuery<TeamType>()
    sseClients.emitToClients("insert-team", team)
    return team
}
export const getTeamById:GetTeamByIdType = async (id) => {
    return await TeamModel.query.filter(TeamModel.c.id.equalTo(id)).fetchOneQuery<TeamType>()
}
export const updateTeam:UpdateTeamType = async (id, newTeam) => {
    const newData = teamSchema.omit({ id:true }).partial().parse(newTeam)
    const team = await TeamModel.update.values(newData).filter(TeamModel.c.id.equalTo(id)).fetchOneQuery<TeamType>()
    sseClients.emitToClients("update-team", team)
    return team
}

export const deleteTeam:DeleteTeamType = async (id) => {
    const team = await TeamModel.delete.filter(TeamModel.c.id.equalTo(id)).fetchOneQuery<TeamType>()
    sseClients.emitToClients("delete-team", [id])
    return team
}

type GetTeamsType = () => Promise<TeamType[]>
type SaveNewTeamType = (newTeam:Omit<TeamType, "id">) => Promise<TeamType>
type GetTeamByIdType = (id:TeamType["id"]) => Promise<TeamType>
type UpdateTeamType = (id:TeamType["id"], newData:Partial<TeamType>) => Promise<TeamType>
type DeleteTeamType = (id:TeamType["id"]) => Promise<TeamType>