import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_jEXaz7USAib2@ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function test() {
  const table = 'leads';
  const res = await sql.query(`SELECT data FROM ${table} ORDER BY updated_at DESC LIMIT 2;`);
  console.log("Found leads via sql.query:", res.length);
}

test().catch(console.error);

