import { Model } from "./model"
import { Condition } from "./query"

type ColumnOption = {
    nullable:boolean
    primaryKey:boolean
    unique:boolean
    foreign:Column | false
    default:any | false
}
type PartialOption = Partial<ColumnOption>

export class Column {
    model?:Model
    options:ColumnOption

    constructor(public name: string, public type: string, public length:number, option?:PartialOption){
        this.options = {
            nullable:true,
            primaryKey:false,
            unique:false,
            foreign:false,
            default:false,
            ...option
        }
    }

    static primary(name:string){
        return new Column(name, "serial", 0, { primaryKey:true })
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

    getBuildSQL(){
        const length = this.length == 0 ? "" : `(${this.length})`
        const nullable = this.options.nullable ? "" : "NOT NULL"
        const primaryKey = this.options.primaryKey ? "PRIMARY KEY" : ""
        const unique = this.options.unique ? "UNIQUE" : ""
        const foreign = this.options.foreign && this.options.foreign.model ? `REFERENCES "${this.options.foreign.model.tableName}"("${this.options.foreign.name}") ON DELETE CASCADE` : ""
        const defaultC = this.options.default ? `DEFAULT ${this.options.default}` : ""
        return `"${this.name}" ${this.type}${length} ${nullable} ${primaryKey} ${unique} ${foreign} ${defaultC}`
    }
}

export class SerialColumn extends Column {
    constructor (name : string, primary:boolean=false ) { 
        super(name, 'SERIAL', 0, { primaryKey:primary })
    }
}

export class IntColumn extends Column {
    constructor (name : string, length:number=0, option?:PartialOption ) { 
        super(name, 'INT', length, option)
    }
}

export class StringColumn extends Column {
    constructor (name : string, length:number=0, option?:PartialOption ) { 
        super(name, length > 0 ? 'VARCHAR' : "TEXT", length, option)
    }
}

export class BooleanColumn extends Column {
    constructor (name : string, nullable:boolean=false ) { 
        super(name, "BOOLEAN", 0, { nullable })
    }
}

export class TimeStampColumn extends Column {
    constructor (name : string ) { 
        super(name, 'TIMESTAMP', 0, { nullable:false, default:`current_timestamp` })
    }
}