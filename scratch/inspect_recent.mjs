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

async function inspectRecent() {
  console.log("=== USERS IN NEON ===");
  const users = await sql`SELECT id, name, username, email, role, status, updated_at FROM users;`;
  console.table(users);

  console.log("=== RECENT AUDIT LOGS ===");
  const logs = await sql`SELECT id, user_name, action, details, timestamp, updated_at FROM audit_logs ORDER BY updated_at DESC LIMIT 10;`;
  console.table(logs);

  console.log("=== COURSES IN NEON ===");
  const courses = await sql`SELECT id, code, name, updated_at, data->'studentIds' as student_ids FROM courses;`;
  console.table(courses);
}

inspectRecent().catch(console.error);
