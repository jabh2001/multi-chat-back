import 'dotenv/config';
import { Client } from 'pg';
import { Model } from './orm';
import { saveNewAgent, verifyOrCreateAdminUser } from '../service/agentService';

// Configuración de la conexión a la base de datos
const {
  NODE_ENV,
  DB_USER,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_TEST_USER,
  DB_TEST_HOST,
  DB_TEST_NAME,
  DB_TEST_PASSWORD,
  DB_TEST_PORT,
} = process.env

const dbConfig = {
  user: DB_USER||'postgres',
  host: DB_HOST||'localhost',
  database: DB_NAME|| 'multi-chat',
  password: DB_PASSWORD || 'pokemon70',
  port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
};

const dbConfigTest = {
  user: DB_TEST_USER,
  host: DB_TEST_HOST,
  database: DB_TEST_NAME,
  password: DB_TEST_PASSWORD,
  port: DB_TEST_PORT ? parseInt(DB_TEST_PORT, 10) : 5432,
};


const client = new Client(NODE_ENV=="test" ? dbConfigTest : dbConfig);
export async function initDBClient(){
  try{
    await client.connect()
    await constructDb()
    await verifyOrCreateAdminUser()
  } catch(e){
      console.error('Error al crear tablas:', e);
  }
}
export const turnOnDB = async () => {
  try {
      await client.query("select 1")
  } catch (e){
      await client.connect()
  }
}
export const constructDb = async () => {
  const query = Model.modelPool.map(m => m.buildSQL()).join(";")
  return await client.query(query);
} 

export const destructDb =async () => {
  const query = Model.modelPool.map(m => m.dropSQL()).join(";")
  return await client.query(query);
}

export const teardownData = async () => {
  const query = Model.modelPool.map(m => m.teardownAllData()).join(";")
  return await client.query(query);
}
// initDBClient()

export default client;
