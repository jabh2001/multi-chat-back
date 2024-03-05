import { LabelType } from "../types";
import { LabelModel } from "../libs/models";

const labels:LabelType[] = [
    { id: 1, name: 'Urgente', description: 'Etiqueta para problemas que requieren atención inmediata.' },
    { id: 2, name: 'Prioridad Baja', description: 'Etiqueta para problemas con baja prioridad.' },
    { id: 3, name: 'Investigación', description: 'Etiqueta para problemas que requieren investigación adicional.' }
]

export const getLabels:GetLabelsType = async () => {
    return await LabelModel.repository.findAll()
}

export const saveNewLabel:SaveNewLabelType = async (newLabel) => {
    return await LabelModel.repository.insert(newLabel)
}
export const getLabelById:GetLabelByIdType = async (id) => {
    return await LabelModel.repository.findById(id)
}
export const updateLabel:UpdateLabelType = async (id, newData) => {
    return await LabelModel.repository.update(id, newData)
}
export const deleteLabel:DeleteLabelType = async (id) => {
    return await LabelModel.repository.delete(id)
}

type GetLabelsType = () => Promise<LabelType[]>
type SaveNewLabelType = (newLabel:Omit<LabelType, "id">) => Promise<LabelType>
type GetLabelByIdType = (id:LabelType["id"]) => Promise<LabelType>
type UpdateLabelType = (id:LabelType["id"], newData:Partial<LabelType>) => Promise<LabelType>
type DeleteLabelType = (id:LabelType["id"]) => Promise<LabelType>