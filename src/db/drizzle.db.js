import  * as schema from '../models/Drizzle.odm/eventhistory.model.js';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

import pkg from 'pg';
const {Client} = pkg;

const client=new Client({
    connectionString: process.env.POSTGRES_URL,
})

client.connect()  // Connect to the PostgreSQL database
    .then(() => {
        console.log("Connected to the postgres database successfully!");
    })
    .catch((err) => {
        console.error("Connection error", err.stack);
    });
export  const Postgresdb=drizzle(client,{schema:schema})