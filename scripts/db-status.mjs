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

if (!connectionString) {
  connectionString =
    'postgresql://neondb_owner:npg_jEXaz7USAib2@ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
}

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

async function checkStatus() {
  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(connectionString);

  const start = performance.now();
  const info = await sql`SELECT version(), current_database(), current_user;`;
  const latency = Math.round(performance.now() - start);

  console.log(`\n Connected to Neon PostgreSQL! (Latency: ${latency}ms)`);
  console.log(`Database: ${info[0].current_database}`);
  console.log(`User:     ${info[0].current_user}`);
  console.log(`Engine:   ${info[0].version.split(' ')[0]} ${info[0].version.split(' ')[1]}`);

  console.log('\n--- Individual Tables in Neon PostgreSQL ---');
  const results = [];
  let totalRecords = 0;

  for (const table of TABLES) {
    try {
      const countRes = await sql.query(`SELECT count(*) as count FROM ${table};`);
      const count = parseInt(countRes[0]?.count || 0, 10);
      results.push({ Table: table, Records: count });
      totalRecords += count;
    } catch {
      results.push({ Table: table, Records: 'Not Created' });
    }
  }

  console.table(results);
  console.log(`Total records across all individual tables: ${totalRecords}\n`);
}

checkStatus().catch((err) => {
  console.error('Error connecting to Neon:', err);
  process.exit(1);
});
