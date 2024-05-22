import { number } from "zod"
import client from "../dataBase"
import { Column } from "./column"
import { Model, Relation } from "./model"
import crypto from "crypto"

type JoinArgs = [Join] | [Relation, Join["type"]]  | [Model, Column, Column] | [Model, Column, Column, Join["type"]]
type Field = Column | Query | RawSQL | Model | Subquery

export class OneFetchNotFound  extends Error {

    constructor() {
        super("OneFetchNotFound")
    }
}
export class Join{
    private _model:Model
    private colA:Column
    private colB:Column
    private type:'INNER'|'LEFT'|'RIGHT'

    set joinType(type:Join["type"]){
        this.type = type
    }
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

    static INNER = "INNER" as const
    static LEFT = "LEFT" as const
    static RIGHT = "RIGHT" as const
}

export class Query {
    protected model:Model
    protected fields:Field[]
    protected isAllSelect:boolean
    protected where:Where
    protected joins:Join[]
    protected _order?:Order
    protected _groupBy?:Group
    private _limit:number
    private _offset:number

    constructor(model: Model) {
        this.model = model;
        this.where = new Where()
        this._order = model.primaryKey?.asc()
        this.fields = Object.values(model.c)
        this.isAllSelect = true
        this.joins = []
        this._limit = 0
        this._offset = 0
    }

    limit(limit:number){
        if(limit < 0) throw Error("Limit can't be negative")
        this._limit = limit
        return this
    }

    offset(offset:number){
        if(offset < 0) throw Error("offset can't be negative")
        this._offset = offset
        return this
    }

    columns(){
        let _fields:Field[] = []
        let params: any[] = []
        if(this.isAllSelect){
            _fields = [...this.fields]
            if (this.joins.length >0){
                for (const join of this.joins) {
                    _fields.push(...Object.values(join.model.c))
                }
            }
        } else {
            _fields = [...this.fields]
        }
        const rawFields = _fields.map((field, i) => {
            if(field instanceof Column){
                const { q, tag } = field
                return `${q} as "${tag}"`
            } else if (field instanceof RawSQL){
                return `${field.raw} as "${field.tag}"`
            } else if (field instanceof Subquery){
                const [subquery, subqueryParams] = field.getSQL()
                params = [ ...params, ...subqueryParams]
                return subquery
            } else if ( field instanceof Model){
                return Object.values(field.c).map(({ q, tag })=>`${q} as "${tag}"`).join(', ')
            }
            throw new Error(`Not valid field ${field}`)
        })
        const fields = rawFields.join(',')
        return [fields, []]
    }



    select(...fields: Field[]){
        this.fields =  fields
        this.isAllSelect = false
        return this
    }

    appendFields(...fields:Field[]){
        this.fields = [...this.fields, ...fields]
        return this
    }

    filter(...condition:Condition[]){
        this.where.conditionList = this.where.conditionList.concat(condition)
        return this
    }
    join(...args:JoinArgs){
        const [arg1, arg2, arg3, arg4] = args
        if(arg1 instanceof Join){
            this.joins.push(arg1)
        } else if(arg1 instanceof Relation){
            let join = arg1.getJoin(this.model)
            if(arg2 && !(arg2 instanceof Column)){
                join.joinType = arg2
            }
            this.joins.push(join)
        } else if(arg2 instanceof Column && arg3 instanceof Column){
            this.joins.push(new Join(arg1, arg2, arg3, arg4 ?? Join.INNER))
        }
        return this
    }
    order(criteria?:Column | Order){
        if(criteria instanceof Column){
            this._order = Order.asc(criteria)
        } else if(criteria instanceof Order ){
            this._order = criteria
        } else {
            this._order = undefined
        }
        return this
    }
    groupBy(column:Column){
        this._groupBy = new Group(column)
        return this
    }
    // Alias for join () but for support change
    bind(model:Model, columnA?:Column, columnB?:Column){
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

    getSQL(initNumber?:number){
        const [fields, fieldsParams] = this.columns()
        const [where, params] = this.where.getWhere(initNumber)
        const join = this.joins.map(j => ` ${j.build()} `).join(" ")
        const order = this._order ? this._order.getOrder() :""
        const limit = this._limit > 0 ? `LIMIT ${this._limit}`: ""
        const offset = this._offset > 0 ? `OFFSET ${this._offset}`: ""
        const groupBy = this._groupBy ? this._groupBy.getGroupBySQL() : ""
        
        let sql = `SELECT ${fields} FROM ${this.model.q} ${join} ${where} ${groupBy} ${order} ${limit} ${offset}`
        return [sql, [...fieldsParams, ...params]]
    }

    buildObjectFromRow(row:any){
        if(this.isAllSelect){
            const ret = this.model.buildObjectFromRow(row)
            this.joins.reduce((prev:any, current, i)=>{
                prev[current.model.tag] = current.model.buildObjectFromRow(row)
                return prev
            }, ret)
            return ret
        } else {
            const ret = this.fields.reduce((prev, current, i)=>{
                if(current instanceof Column){
                    prev[current.options.label ?? current.name] = row[current.tag]
                } else if (current instanceof Subquery ) {
                    prev[current.tag] = row[current.tag]
                } else if( current instanceof RawSQL){
                    prev[current.tag] = row[current.tag]
                } else if( current instanceof Model){
                    prev[current.tag] = current.buildObjectFromRow(row)
                }
                return prev
            }, {} as {[key:string]: any})
            return ret
        }
        
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
            throw new OneFetchNotFound()
        }
        return this.buildObjectFromRow(result.rows[0]) as any;
    
    }
    async fetchAllQuery<T>():Promise<T[]>{
        const [sql, params] = this.getSQL()
        const result = await client.query(sql as any, params as any)
        return result.rows.map((r:any) => this.buildObjectFromRow(r)) as any;
    }
    subquery(label: string){
        let q = new Subquery(this, label);
        return q
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
        const [where, params] = this.where.getWhere(values.length + 1)

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

    getWhere(init:number=1):[string, any[]]{
        if (this.conditionList.length <= 0) return ['', []]
        let num = init
        const [conditions, params ] = this.conditionList.reduce((acc, current)=>{
            const [conditions, params] = acc
            if(current.value instanceof Column){
                return [
                    [...conditions, current.build("")],
                    params
                ]
            }
            return [
                [...conditions, current.build(String(num++))],
                [...params, current.value]
            ]
        }, [[], []] as [string[], any[]])
        const condition = conditions.join(" AND ")
        return [`WHERE ${condition}`, params]
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
        if(this.value instanceof Column){
            return `${this.field.q} ${this.condition} ${this.value.q}`
        }
        return `${this.field.q} ${this.condition} $${numberParam}`
    }
}
export class Order{
    constructor(private column:Column, private type:"ASC" | "DESC"){}

    getOrder(){
        return `ORDER BY ${this.column.q} ${this.type}`
    }
    static asc(column:Column){
        return new Order(column, Order.ASC)
    }
    static desc(column:Column){
        return new Order(column, Order.DESC)
    }
    public static ASC = "ASC" as const 
    public static DESC = "DESC" as const
}

export class Group {
    constructor(private column:Column){}

    getGroupBySQL(){
        return `GROUP BY ${this.column.q}`
    }
}

export class Subquery{
    private id:number

    get label(){ return this._label }
    get query(){ return this._query}
    get tag(){ return this._label ?? `subquery_${this.id}`}


    constructor(private _query:Query, private _label:string){
        this.id = Math.floor(Math.random() * 10000)
    }

    getSQL(initNumber? : number): [string , any[]] {
        const [query, params ] = this.query.getSQL(initNumber)
        return [`(${query}) as "${this.tag}"`, params as any]
    }
}

export class RawSQL {
    private id:number
    private _label?:string

    get raw(){ return this._sql }
    get tag(){ return this._label ?? `raw_${this.id}` }

    constructor(private _sql:string){
        this.id = Math.floor(Math.random() * 10000)
    }

    label(label:string){
        this._label = label
        return this
    }

}