import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',  // Folder for generated migration files
    schema: './src/models/Drizzle.odm/eventhistory.model.js',  // Path to your schema file
    dialect: 'postgresql',  // Specify PostgreSQL
    dbCredentials: {
        host: process.env.POSTGRES_HOST,    // Database host from .env
        port: process.env.POSTGRES_PORT,    // Database port from .env
        database: process.env.POSTGRES_DATABASE,  // Database name from .env
        user: process.env.POSTGRES_USER,    // Database user from .env
        password: process.env.POSTGRES_PASSWORD, // Database password from .env
        ssl: false  // Convert to boolean if needed
    },
});
