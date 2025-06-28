import { Pool } from 'pg';

let conn: any
if (!conn) {
    conn = new Pool({
        user: 'me',
        password: '123456789',
        database: 'zkdb',
        host: 'localhost',
        port: 5432,
    })
}
export { conn };