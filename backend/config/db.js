import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "6525",
    database: "nantralptf"
});

export default pool;
