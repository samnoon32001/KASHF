import { neon } from '@neondatabase/serverless';

const connectionString = 'postgresql://neondb_owner:npg_jEXaz7USAib2@ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function test() {
  const table = 'leads';
  const id = 'lead-test-123';
  const data = { id, name: 'Test Lead', phone: '123456', email: 'test@example.com', status: 'new' };
  
  await sql.query(
    `INSERT INTO ${table} (id, name, phone, email, status, data, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       phone = EXCLUDED.phone,
       email = EXCLUDED.email,
       status = EXCLUDED.status,
       data = EXCLUDED.data,
       updated_at = NOW();`,
    [id, data.name, data.phone, data.email, data.status, JSON.stringify(data)]
  );

  const res = await sql.query(`SELECT data FROM ${table} WHERE id = $1;`, [id]);
  console.log("Upserted and retrieved:", res[0].data);

  // Clean up
  await sql.query(`DELETE FROM ${table} WHERE id = $1;`, [id]);
  console.log("Cleaned up test record.");
}

test().catch(console.error);

