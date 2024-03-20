import { Client } from 'pg';
import { Model } from './orm';
import { saveNewAgent } from '../service/agentService';

// Configuración de la conexión a la base de datos
const dbConfig = {
  user: process.env.DB_USER||'postgres',
  host: process.env.DB_HOST||'localhost',
  database: process.env.DB_NAME|| 'multichat',
  password: process.env.DB_PASSWORD || 'pokemon70',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
};

if (!dbConfig.user || !dbConfig.host || !dbConfig.database) {
  console.error(dbConfig);
  console.error('Falta configuración de la base de datos en las variables de entorno.');
  process.exit(1);
}

const client = new Client(dbConfig);

// Connect to the database
client.connect()
  .then(async () => {
    try {
      const query = Model.modelPool.map(m => m.buildSQL()).join(";")
      await client.query(query);
      const result = await client.query(`SELECT * FROM public."user" where email = 'admin@admin.com' limit 1;`);
      if(!result.rowCount){
        await saveNewAgent({ name:"admin", email:"admin@admin.com", role:"admin", password:process.env.USER_ADMIN_PASSWORD||'a super secret passwors'} as any);
      }
    } catch (error) {
      console.error('Error al crear tablas:', error);
    }
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });
  
export default client;
