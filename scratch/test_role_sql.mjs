import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const envPath = resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) connectionString = match[1];
  }
}

const sql = neon(connectionString);

async function testRoleUpsert() {
  const table = 'roles';
  const id = 'role-telecaller';
  const data = {
    id: 'role-telecaller',
    name: 'Telecaller',
    roleKey: 'telecaller',
    permissions: ['leads.view', 'leads.create', 'courses.view'],
  };
  const dataJson = JSON.stringify(data);

  console.log("Attempting upsert on roles table with query:");
  try {
    const res = await sql.query(
      `INSERT INTO ${table} (id, data, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET
         data = EXCLUDED.data,
         updated_at = NOW()
       RETURNING *;`,
      [id, dataJson]
    );
    console.log("Upsert succeeded! Row returned:", res);
  } catch (err) {
    console.error("Upsert failed with error:", err);
  }
}

testRoleUpsert().catch(console.error);

