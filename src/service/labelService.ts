import { LabelType } from "../types";

const labels:LabelType[] = [
    { id: 1, name: 'Urgente', description: 'Etiqueta para problemas que requieren atención inmediata.' },
    { id: 2, name: 'Prioridad Baja', description: 'Etiqueta para problemas con baja prioridad.' },
    { id: 3, name: 'Investigación', description: 'Etiqueta para problemas que requieren investigación adicional.' }
]

export const getTeams:GetLabelsType = async () => {
    return new Promise((resolve) => resolve(labels));
}

export const saveNewLabel:SaveNewLabelType = async (newLabel) => {
    const labelWithId = { ...newLabel, id: Math.max(...labels.map(t=>t.id)) + 1 };
    labels.push(labelWithId);
    return new Promise((resolve) => resolve(labelWithId))
}
export const getLabelById:GetLabelByIdType = async (id) => {
    const index = labels.findIndex(t => t.id === id);
    if (index !== -1){
        return new Promise((resolve)=>resolve(labels[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Label not found"}))
}
export const updateLabel:UpdateLabelType = async (id, newData) => {
    const index = labels.findIndex(t => t.id === id);
    if (index !== -1){
        labels[index] = { ...labels[index], ...newData}
        return new Promise((resolve)=>resolve(labels[index]));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Label not found"}))
}
export const deleteLabel:DeleteLabelType = async (id) => {
    const index = labels.findIndex(t => t.id === id);
    if (index !== -1){
        const [label] = labels.splice(index, 1)
        return new Promise((resolve)=>resolve(label));
    }
    return new Promise((_, reject) => reject({ status:404, msg:"Team not found"}))
}

type GetLabelsType = () => Promise<LabelType[]>
type SaveNewLabelType = (newLabel:Omit<LabelType, "id">) => Promise<LabelType>
type GetLabelByIdType = (id:LabelType["id"]) => Promise<LabelType>
type UpdateLabelType = (id:LabelType["id"], newData:Partial<LabelType>) => Promise<LabelType>
type DeleteLabelType = (id:LabelType["id"]) => Promise<LabelType>