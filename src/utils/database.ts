import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const conn = new Pool({
    connectionString: process.env.POSTGRES_URL,
});
