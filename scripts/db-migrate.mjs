import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

const firebaseConfig = JSON.parse(
  readFileSync(resolve(process.cwd(), 'firebase-applet-config.json'), 'utf8')
);

const ALL_COLLECTIONS = [
  'users',
  'roles',
  'courses',
  'subjects',
  'classes',
  'recordedClasses',
  'attendance',
  'tasks',
  'taskSubmissions',
  'creativeTasks',
  'media',
  'leads',
  'notifications',
  'auditLogs',
  'pointsHistory',
];

async function migrate() {
  console.log('🚀 Starting Firebase Firestore -> Neon PostgreSQL Migration...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  const sql = neon(connectionString);

  // 1. Ensure tables exist
  console.log('📦 Ensuring Neon tables and indexes exist...');
  await sql`
    CREATE TABLE IF NOT EXISTS kashf_documents (
      collection VARCHAR(64) NOT NULL,
      id VARCHAR(128) NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (collection, id)
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_kashf_documents_collection ON kashf_documents (collection);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_kashf_documents_updated_at ON kashf_documents (updated_at DESC);`;
  await sql`
    CREATE TABLE IF NOT EXISTS kashf_metadata (
      key VARCHAR(128) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  let totalMigrated = 0;

  for (const colName of ALL_COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (!snap.empty) {
        console.log(` Migrating ${snap.size} records from collection '${colName}'...`);
        for (const docSnap of snap.docs) {
          const data = { ...docSnap.data(), id: docSnap.id };
          await sql`
            INSERT INTO kashf_documents (collection, id, data, updated_at)
            VALUES (${colName}, ${docSnap.id}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (collection, id)
            DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          totalMigrated++;
        }
      }
    } catch (err) {
      console.warn(`⚠️ Warning on collection '${colName}':`, err.message);
    }
  }

  // Singleton settings
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'institution'));
    if (settingsSnap.exists()) {
      console.log(" Migrating 'settings/institution' singleton...");
      const data = settingsSnap.data();
      await sql`
        INSERT INTO kashf_documents (collection, id, data, updated_at)
        VALUES ('settings', 'institution', ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (collection, id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
      `;
      totalMigrated++;
    }
  } catch (err) {
    console.warn('⚠️ Warning on settings singleton:', err.message);
  }

  // Mark seed metadata
  const seedMeta = {};
  for (const colName of ALL_COLLECTIONS) seedMeta[colName] = true;
  seedMeta['settings'] = true;

  await sql`
    INSERT INTO kashf_metadata (key, value, updated_at)
    VALUES ('initial_seed', ${JSON.stringify(seedMeta)}::jsonb, NOW())
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
  `;

  console.log(`\n🎉 Migration Complete! Successfully migrated ${totalMigrated} items to Neon PostgreSQL.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

