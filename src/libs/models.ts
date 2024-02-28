import client from "./dataBase";

class BaseModel {
    toObject() {
        return { ...this };
    }

    static fromObject<T extends BaseModel>(classType: new () => T, object: object): T {
        const instance = new classType();
        Object.assign(instance, object);
        return instance;
    }
}


class BaseRepository {
    tableName:string
    constructor(tableName:string) {
        this.tableName = tableName;
    }

    async insert(item:object) {
        const keys = Object.keys(item);
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

    async update(id:1, updates: { [s: string]: unknown; } | ArrayLike<unknown>) {
        const setStatements = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');

        const query = `
        UPDATE ${this.tableName}
        SET ${setStatements}
        WHERE id = $${Object.keys(updates).length + 1}
        RETURNING *;
      `;

        const result = await client.query(query, [...Object.values(updates), id]);
        return result.rows[0];
    }

    async findById(id: any) {
        const query = `
        SELECT * FROM ${this.tableName}
        WHERE id = $1;
      `;

        const result = await client.query(query, [id]);
        return result.rows[0];
    }

    async findAll() {
        const query = `SELECT * FROM ${this.tableName};`;
        const result = await client.query(query);
        return result.rows;
    }

    async delete(id: any) {
        const query = `
        DELETE FROM ${this.tableName}
        WHERE id = $1
        RETURNING *;
      `;

        const result = await client.query(query, [id]);
        return result.rows[0];
    }
}