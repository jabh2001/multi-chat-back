import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();
import '../../.env'
// Configuración de la conexión a la base de datos
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
};
if (!dbConfig.user || !dbConfig.host || !dbConfig.database) {
  console.error('Falta configuración de la base de datos en las variables de entorno.');
  process.exit(1);
}

const connectToDatabase = async () => {
  const client = new Client(dbConfig);
  client.connect();


  // Ejecutar la consulta de creación de tabla
  const createTableQuery = `CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversation(id),
    content TEXT,
    content_type VARCHAR(50),
    message_type VARCHAR(50),
    private BOOLEAN,
    created_at TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS conversation (
    id SERIAL PRIMARY KEY,
    account_id INT REFERENCES usuarios(id),
    inbox_id INT REFERENCES inbox(id),
    sender_id INT REFERENCES contact(id),
    user_id INT REFERENCES usuarios(id)
  );
  
  CREATE TABLE IF NOT EXISTS inbox (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    channel_type VARCHAR(50)
  );
  CREATE TABLE IF NOT EXISTS team (
    id INT PRIMARY KEY,  
    name varchar (50),
   description text   
   );
  
  CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    phone_number VARCHAR(15),
    avatar_url VARCHAR(255)
  );
  
  CREATE TABLE IF NOT EXISTS label (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    description TEXT
  );
  
  CREATE TABLE IF NOT EXISTS contact_label (
    contact_id INT REFERENCES contact(id),
    label_id INT REFERENCES label(id)
  );
  
  CREATE TABLE IF NOT EXISTS user_team (
    user_id INT REFERENCES usuarios(id),
    team_id INT REFERENCES team(id)
  );`
  await client.query(createTableQuery);

  return client;
};

export default connectToDatabase
