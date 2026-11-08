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

const TABLES = [
  'users',
  'roles',
  'courses',
  'subjects',
  'classes',
  'recorded_classes',
  'attendance',
  'tasks',
  'task_submissions',
  'creative_tasks',
  'media',
  'leads',
  'notifications',
  'audit_logs',
  'points_history',
  'settings',
];

async function checkRecentActivity() {
  console.log("=== RECENT ACTIVITY ACROSS ALL TABLES ===");
  for (const table of TABLES) {
    try {
      const rows = await sql.query(`SELECT id, updated_at FROM ${table} ORDER BY updated_at DESC LIMIT 3;`);
      if (rows.length > 0) {
        console.log(`Table '${table}' (${rows.length} latest):`);
        rows.forEach(r => console.log(`   id: ${r.id}, updated_at: ${r.updated_at}`));
      } else {
        console.log(`Table '${table}': 0 rows`);
      }
    } catch (e) {
      console.log(`Table '${table}' error:`, e.message);
    }
  }
}

checkRecentActivity().catch(console.error);
