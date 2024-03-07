import { LabelType } from "../types";
import { LabelModel } from "../libs/models";
import { labelSchema } from "../libs/schemas";

export const getLabels:GetLabelsType = async () => {
    return await LabelModel.query.fetchAllQuery<LabelType>()
}

export const saveNewLabel:SaveNewLabelType = async (newLabel) => {
    const newData = labelSchema.omit({ id:true }).parse(newLabel)
    return await LabelModel.insert.value(newData).fetchOneQuery<LabelType>()
}
export const getLabelById:GetLabelByIdType = async (id) => {
    return await LabelModel.query.filter(LabelModel.c.id.equalTo(id)).fetchOneQuery<LabelType>()
}
export const updateLabel:UpdateLabelType = async (id, newLabel) => {
    const newData = labelSchema.omit({ id:true }).parse(newLabel)
    return await LabelModel.update.values(newData).filter(LabelModel.c.id.equalTo(id)).fetchOneQuery<LabelType>()
}
export const deleteLabel:DeleteLabelType = async (id) => {
    return await LabelModel.delete.filter(LabelModel.c.id.equalTo(id)).fetchOneQuery<LabelType>()
}

type GetLabelsType = () => Promise<LabelType[]>
type SaveNewLabelType = (newLabel:Omit<LabelType, "id">) => Promise<LabelType>
type GetLabelByIdType = (id:LabelType["id"]) => Promise<LabelType>
type UpdateLabelType = (id:LabelType["id"], newData:Partial<LabelType>) => Promise<LabelType>
type DeleteLabelType = (id:LabelType["id"]) => Promise<LabelType>