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

async function inspectAuditLogs() {
  const logs = await sql`
    SELECT id, data, updated_at 
    FROM audit_logs 
    ORDER BY updated_at DESC 
    LIMIT 15;
  `;
  console.log("Latest Audit Logs:");
  logs.forEach(l => {
    console.log(`[${l.updated_at}] ${l.data.action} | ${l.data.module} | ${l.data.details}`);
  });
}

inspectAuditLogs().catch(console.error);

