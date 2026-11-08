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

async function inspectRoles() {
  const roles = await sql`SELECT id, name, role_key, description, updated_at FROM roles LIMIT 5;`;
  console.table(roles);
}

inspectRoles().catch(console.error);
