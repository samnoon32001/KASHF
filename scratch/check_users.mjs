import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_jEXaz7USAib2@ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  const users = await sql`SELECT id, name, email, role, data->>'username' as uname, data->>'password' as pwd FROM users;`;
  console.log('All Users in Neon:');
  console.table(users);
}

main().catch(console.error);

