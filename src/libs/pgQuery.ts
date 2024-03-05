import client from "./dataBase";

export class BaseRepository<T=any> {
    _scheme:string
    _tableName:string

    constructor(tableName:string, scheme?:string) {
        this._tableName = tableName;
        this._scheme = scheme ?? "public"
    }
    get tableName(){ return `${this._scheme}."${this._tableName}"`}

    async insert(item:object):Promise<T> {
        const keys = Object.keys(item).map(i => `"${i}"`);
        const values = Object.values(item);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

        const query = `
        INSERT INTO ${this.tableName} (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING *;
      `;
        
        const result = await client.query(query, values);
        return result.rows[0];
    }

    async update(id:any, updates: { [s: string]: unknown; } | ArrayLike<unknown>):Promise<T> {
        const setStatements = Object.keys(updates).map((key, index) => `"${key}" = $${index + 1}`).join(', ');

        const query = `
        UPDATE ${this.tableName}
        SET ${setStatements}
        WHERE id = $${Object.keys(updates).length + 1}
        RETURNING *;
      `;

        const result = await client.query(query, [...Object.values(updates), id]);
        return result.rows[0];
    }

    async findById(id: any):Promise<T> {
        const query = `
        SELECT * FROM ${this.tableName}
        WHERE id = $1;
      `;

        const result = await client.query(query, [id]);
        return result.rows[0];
    }

    async findAll():Promise<T[]> {
        const query = `SELECT * FROM ${this.tableName} order by id asc;`;
        const result = await client.query(query);
        return result.rows;
    }

    async delete(id: any):Promise<T> {
        const query = `
        DELETE FROM ${this.tableName}
        WHERE id = $1
        RETURNING *;
      `;

        const result = await client.query(query, [id]);
        return result.rows[0];
    }
}

export class BaseModel {
    toObject() {
        return { ...this } as any;
    }

    static fromObject<T extends BaseModel>(classType:any, object: object): T {
        const instance = new classType();
        Object.assign(instance, object);
        return instance;
    }
}

export class Column {
    model?:Model
    constructor(public name: string, public primary:boolean=false){}

    static primary(name:string){
        return new Column(name, false)
    }
    get tag(){
        if(!this.model) return ""
        const tableName = this.model.tableName
        return `${tableName}_${this.name}`
    }
    get q(){
        if(!this.model) return ""
        const tableName = this.model.tableName
        return `"${tableName}"."${this.name}"`
    }
    
    equalTo(value: any){
        return new Condition('=', this , value)
    }
    
    differenceTo(value: any){
        return new Condition('!=', this , value)
    }

    greaterThan(value: any){
        return new Condition('>', this , value)
    }

    greaterEqualThan(value: any){
        return new Condition('>=', this , value)
    }

    lessThan(value: any){
        return new Condition('<', this , value)
    }

    lessEqualThan(value: any){
        return new Condition('<=', this , value)
    }
}

export class Model extends BaseModel {
    tableName:string
    repository:BaseRepository
    c:{[key:string]:Column}

    constructor(tableName:string){
        super()
        this.repository = new BaseRepository(tableName)
        this.tableName = tableName
        this.c = {}
    }

    addColumn(column:Column | string){
        if(column instanceof Column){
            this.c[column.name] = column
            column.model = this
        } else {
            const newCol =  new Column(column)
            this.c[column] = newCol
            newCol.model = this
        }
        return this
    }

    get query(){
        const query = new Query(this)
        return query
    }
    get insert(){
        const query = new Insert(this)
        return query
    }
    get update(){
        const query = new Update(this)
        return query
    }
    get delete(){
        const query = new Delete(this)
        return query
    }
    
    get primaryKey(){
        const columns = Object.values(this.c)
        const c = columns.find(c => {
            return c.primary === true
        })
        return c ?? columns.length > 0 ? columns[0] : undefined
    }

    buildObjectFromRow(row:any){
        const obj = {}
        const fields = Object.keys(row).filter(f => f.startsWith(this.tableName))
        const columnsName = Object.values(this.c).reduce((prev:any, current)=>{
            prev[current.name.toLowerCase()] = current.name
            return prev
        }, {})  
        fields.reduce((prev:any, current, i)=>{
            const key = current.slice(this.tableName.length +1)
            prev[columnsName[key]] = row[current]
            return prev
        }, obj)
        return obj
    }
}
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

    join(model:Model, modelC?:Column){
        this.joins.push(new Join(model, modelC ?? model.primaryKey as any, this.model.primaryKey as any))
        return this
    }

    getSQL(){
        const fields = this.columns()
        const [where, params] = this.where.getWhere()
        const join = this.joins.map(j => ` ${j.build()} `).join(" ")

        let sql = `SELECT ${fields} FROM ${this.model.repository.tableName} ${join} ${where}`
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

    async fetchOneQuery<T>():Promise<T>{
        const [sql, params] = this.getSQL()
        const result = await client.query(sql as any, params as any)
        if(!result.rows.length) throw new Error('No ' + this.model.tableName + ' found!')
        return this.buildObjectFromRow(result.rows[0]) as any;
    
    }
    async fetchAllQuery<T>():Promise<T[]>{
        const [sql, params] = this.getSQL()
        const result = await client.query(sql as any, params as any)
        return result.rows.map((r:any) => this.buildObjectFromRow(r)) as any;
    }
}

class Insert extends Query{
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
}

class Update extends Query {
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
}

class Delete extends Query {
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
// const query = new Query("contact")
// query.equalTo("name", "jhonder").greaterEqualThan("old", 18).differenceTo("country", "us")
// console.log(query.getSQL())