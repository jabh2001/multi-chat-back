import client from "../dataBase"
import { Column } from "./column"
import { Model } from "./model"

export class Join{
    private _model:Model
    private colA:Column
    private colB:Column
    private type:'INNER'|'LEFT'|'RIGHT'

    get model(){
        return this._model
    }
    constructor(model:Model, colA:Column, colB:Column, type:'INNER'|'LEFT'|'RIGHT' = "INNER"){
        this._model = model
        this.colA = colA
        this.colB = colB
        this.type = type
    }

    build(){
        return `${this.type} JOIN ${this.model.repository.tableName} ON ${this.colA.q} = ${this.colB.q}`
    }
}

export class Query {
    protected model:Model
    protected fields:Column[]
    protected where:Where
    protected joins:Join[]
    protected order:Order


    constructor(model: Model) {
        this.model = model;
        this.where = new Where();
        this.order = new Order()
        this.fields = Object.values(model.c)
        this.joins = []
    }

    columns(){
        const _fields = [...this.fields]
        if (this.joins.length >0){
            for (const join of this.joins) {
                _fields.push(...Object.values(join.model.c))
            }
        }
        const fields = _fields.map(({ q, tag }) => `${q} as ${tag}`).join(',')
        return fields
    }

    select(...fields: Column[]){
        this.fields =  fields
        return this
    }

    filter(...condition:Condition[]){
        this.where.conditionList = this.where.conditionList.concat(condition)
        return this
    }

    join(model:Model, columnA?:Column, columnB?:Column){
        let join : Join | undefined = undefined
        if (!columnA && !columnB){
            for(const c of Object.values(model.c) ){
                if(c.options.foreign && c.options.foreign.model == this.model){
                    join = new Join(model, c, this.model.primaryKey as any)
                    break
                }
            }
            if(!join){
                for(const c of Object.values(this.model.c) ){
                    if(c.options.foreign && c.options.foreign.model == model){
                        join = new Join(model, c, model.primaryKey as any)
                        break
                    }
                }
            }
        } else if (columnA && !columnB) {
            let j:Column = Object.values(this.model.c).find((v)=> v.options.foreign === columnA ) || this.model.primaryKey as any
            join = new  Join(model, columnA, j)
        } else if(columnA && columnB) {
            join = new Join(model, columnA, columnB)
        } else {
            throw new Error("Join  error, not dependencies found")
        }
        this.joins.push(join as Join)
        return this
    }

    getSQL(){
        const fields = this.columns()
        const [where, params] = this.where.getWhere()
        const join = this.joins.map(j => ` ${j.build()} `).join(" ")
        const order = this.model.primaryKey ? `ORDER BY ${this.model.primaryKey.q}`:""

        let sql = `SELECT ${fields} FROM ${this.model.repository.tableName} ${join} ${where} ${order}`
        return [sql, params]
    }

    buildObjectFromRow(row:any){
        const ret = this.model.buildObjectFromRow(row)
        this.joins.reduce((prev:any, current, i)=>{
            prev[current.model.tableName] = current.model.buildObjectFromRow(row)
            return prev
        }, ret)
        return ret
    }

    async execute():Promise<any>{
        const [sql, params] = this.getSQL()
        const result = await client.query(sql as any, params as any)
        return this.buildObjectFromRow(result.rows) as any;
    }

    async fetchOneQuery<T>():Promise<T>{
        const [sql, params] = this.getSQL()
        const result = await client.query(sql as any, params as any)
        if(result.rows.length == 0){
            throw new Error(`Source not found`)
        }
        return this.buildObjectFromRow(result.rows[0]) as any;
    
    }
    async fetchAllQuery<T>():Promise<T[]>{
        const [sql, params] = this.getSQL()
        const result = await client.query(sql as any, params as any)
        return result.rows.map((r:any) => this.buildObjectFromRow(r)) as any;
    }
}

export class Insert extends Query{
    protected obj:Array<{[key:string]:string | number}>

    constructor(model:Model, obj:any=[]){
        super(model)
        this.obj = obj
    }
    value(values:any){
        this.obj = [values]
        return this
    }

    values(...values:any[]){
        this.obj = [...this.obj, ...values]
        return this
    }
    get placeholders(){
        const params:any[] = []
        const columnsName = Object.keys(this.obj[0])
        const cols = Object.keys(this.model.c).filter(c => columnsName.includes(c))

        const placeholders =  this.obj.map((insert) => {
        
            const insertStr = cols.map(c => {
                if(Object.keys(insert).includes(c)){
                    params.push(insert[c])
                } else {
                    params.push("null")
                }
                return `$${params.length}`
            })
            return `(${insertStr})`
        }).join(', ');
        return [placeholders, params]
    }
    get keys(){
        const columnsName = Object.keys(this.obj[0])
        const keys = Object.values(this.model.c).filter(o => columnsName.includes(o.name)).map(o => `"${o.name}"`);
        return keys.join(', ')
    }
    getSQL(): (string | any[])[] {
        const [placeholders, params] = this.placeholders

        let sql = `INSERT INTO ${this.model.repository.tableName} (${this.keys}) VALUES ${placeholders} RETURNING *;`
        return [sql, params]
    }

    buildObjectFromRow(row:any){
        return row
    }
}

export class Update extends Query {
    protected obj:{[key:string]:string | number}

    constructor(model:Model, obj:any={}){
        super(model)
        this.obj = obj
    }

    values(values:object){
        this.obj = {...this.obj, ...values}
        return this
    }

    get keys(){
        const setStatements = Object.keys(this.obj).map((key, index) => `"${key}" = $${index + 1}`).join(', ');
        return setStatements
    }
    setStatement(){
        const values = Object.values(this.obj)
        return[ `SET ${this.keys}`, values]
    }
    getSQL(): (string | any[])[] {
        const [ statement, values ] = this.setStatement()
        const [where, params] = this.where.getWhere(values.length)

        let sql = `UPDATE ${this.model.repository.tableName} ${statement}  ${where} RETURNING *;`
        return [sql, [...values, ...params]]
    }

    buildObjectFromRow(row:any){
        return row
    }
}

export class Delete extends Query {
    getSQL(): (string | any[])[] {
        const [where, params] = this.where.getWhere()

        let sql = `DELETE FROM ${this.model.repository.tableName} ${where} RETURNING *;`
        return [sql, params]
    }
}
export class Where{
    conditionList:Condition[] = []

    getWhere(init:number=0):[string, any[]]{
        if (this.conditionList.length <= 0) return ['', []]
        const conditions = this.conditionList.map((c, i) => c.build(String(i+1+init)))
        const condition = conditions.join(" AND ")
        return [`WHERE ${condition}`, this.conditionList.map(c => c.value)]
    }

    buildObjectFromRow(row:any){
        return row
    }
}
export class Condition {
    private field:Column
    private condition:string
    private _value:any;

    constructor(condition:string, field:Column, value:any){
        this.field = field
        this.condition = condition
        this._value = value
    }
    get value() { return this._value}

    build(numberParam:string){
        return `${this.field.q} ${this.condition} $${numberParam}`
    }
}
export class Order{}