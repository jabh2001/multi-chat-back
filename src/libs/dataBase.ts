import { Client } from 'pg';
// import * as dotenv from 'dotenv';
// dotenv.config();
// import '../../.env';

// Configuración de la conexión a la base de datos
// const dbConfig = {
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
// };

const dbConfig = {
  user: "postgres",
  host: "localhost",
  database: "multi-chat",
  password: "123456",
  port: 5432,
};

// Validate database configuration
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
      // Ejecutar la consulta de creación de tabla
      const createTableQuery =`
      CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        role VARCHAR(8) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS label (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        description TEXT
      );
      
      CREATE TABLE IF NOT EXISTS team (
        id SERIAL PRIMARY KEY,  
        name varchar (50),
       description text   
       );
       
       CREATE TABLE IF NOT EXISTS contact (
         id SERIAL PRIMARY KEY,
         name VARCHAR(50),
         email VARCHAR(100),
         "phoneNumber" VARCHAR(15),
         "avatarUrl" VARCHAR(255)
       );
      
      CREATE TABLE IF NOT EXISTS inbox (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        "channelType" VARCHAR(50)
      );
      
      CREATE TABLE IF NOT EXISTS conversation (
        id SERIAL PRIMARY KEY,
        "accountId" INT REFERENCES "user"(id),
        "inboxId" INT REFERENCES inbox(id),
        "senderId" INT REFERENCES contact(id),
        "userId" INT REFERENCES "user"(id)
      );
      
      CREATE TABLE IF NOT EXISTS message (
        id SERIAL PRIMARY KEY,
        "conversationId" INT REFERENCES conversation(id),
        content TEXT,
        "contentType" VARCHAR(50),
        "messageType" VARCHAR(50),
        private BOOLEAN,
        "createdAt" TIMESTAMP
      );

      -- CREATE TYPE social_network AS ENUM ('facebook' , 'gmail' , 'instagram' , 'whatsapp' , 'telegram' , 'linkedin' , 'threads');

      CREATE TABLE IF NOT EXISTS social_media (
        id SERIAL PRIMARY KEY,
        "contactId" int REFERENCES contact(id),
        name social_network,
        url TEXT,
        "displayText" VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS contact_label (
        "contactId" INT REFERENCES contact(id),
        "labelId" INT REFERENCES label(id)
      );
      
      CREATE TABLE IF NOT EXISTS user_team (
        "userId" INT REFERENCES "user"(id),
        "teamId" INT REFERENCES team(id)
      );
      `

      await client.query(createTableQuery);
      console.log('Tablas creadas exitosamente');
    } catch (error) {
      console.error('Error al crear tablas:', error);
    } finally {
      // Ensure to close the database connection
      // client.end();
    }
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });

export default client;
