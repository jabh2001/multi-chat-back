import client from "../dataBase";
import { Column } from "./column";
import { Delete, Insert, Join, Query, Update } from "./query";


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
    async deleteAll() {
        const query = `DELETE FROM ${this.tableName} WHERE 1 = 1;`;
        const result = await client.query(query);
        return result;
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
export class Model extends BaseModel {
    static modelPool:Model[] = []
    tableName:string
    repository:BaseRepository
    c:{[key:string]:Column}
    r:{[key:string]:Relation}
    public _alias?:string
    get q(){
        return this.repository.tableName + (this._alias ? ` as "${this.tag}"`: "")
    }
    get tag(){
        return this._alias ?? this.tableName
    }

    constructor(tableName:string, columns:Column[]=[], _pushPool=true){
        super()
        if(_pushPool){
            Model.modelPool.push(this)
        }
        this.repository = new BaseRepository(tableName)
        this.tableName = tableName
        this.c = {}
        this.r = {}
        columns.forEach(c => this.addColumn(c))
    }

    addColumn(column:Column){
        this.c[column.name] = column
        column.model = this
        if(column.options.foreign && column.options.foreign.model && column.options.relation){
            const otherColumn = column.options.foreign
            const otherModel = column.options.foreign.model
            const oRelation = column.options.relation
            const newRelation = new Relation(column, otherColumn)

            this.r[oRelation.name] = newRelation
            otherModel.r[oRelation.backRef] = newRelation
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
            return c.options.primaryKey === true
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
            prev[key] = row[current]

            return prev
        }, obj)
        return obj
    }

    buildSQL(){
        return `CREATE TABLE IF NOT EXISTS "${this.tableName}" (${ Object.values(this.c).map(c => c.getBuildSQL()).join(",") });`
    }
    dropSQL(){
        return `DROP TABLE IF EXISTS "${this.tableName}"`
    }
    teardownAllData(){
        return `DELETE FROM "${this.tableName}" WHERE 1 = 1;`
    }
    async fetchTeardownAllData(){
        return await client.query(this.teardownAllData())
    }

    alias(alias:string){
        const aliasModal = new Model(this.tableName, Object.values(this.c).map(c => c.deepCopy(this)), false)
        aliasModal._alias = alias
        return aliasModal
    }
}


export class Relation {
    private modelA:Model
    private modelB: Model
    private columnA:Column
    private columnB:Column

    constructor(column:Column, foreign:Column){
        if(!column.model || !foreign.model){
            throw new Error("A column must be related to a model")
        }
        this.columnA = column
        this.columnB = foreign
        this.modelA = column.model
        this.modelB = foreign.model
    }

    getJoin(main:"modelA" | "modelB" | Model = "modelA"){
        let mainM:Model
        if(main instanceof Model){
            if(main === this.columnA.model){
                mainM = this.columnB.model as any
            } else if(main === this.columnB.model){
                mainM = this.columnA.model as any
            } else {
                throw new Error("Invalid argument for join() method.")
            }
        } else{
            mainM = this[main]
        }
        return new Join(mainM, this.columnA, this.columnB)
    }

}