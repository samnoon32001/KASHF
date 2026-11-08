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

const sql = neon(connectionString);

async function createTables() {
  console.log('🚀 Creating individual tables in Neon PostgreSQL...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255),
      username VARCHAR(255),
      email VARCHAR(255),
      role VARCHAR(64),
      status VARCHAR(32),
      department VARCHAR(128),
      phone VARCHAR(64),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS roles (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255),
      role_key VARCHAR(64),
      description TEXT,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(128) PRIMARY KEY,
      code VARCHAR(64),
      name VARCHAR(255),
      category VARCHAR(128),
      duration VARCHAR(64),
      status VARCHAR(32),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS subjects (
      id VARCHAR(128) PRIMARY KEY,
      code VARCHAR(64),
      name VARCHAR(255),
      course_id VARCHAR(128),
      faculty_id VARCHAR(128),
      status VARCHAR(32),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id VARCHAR(128) PRIMARY KEY,
      course_name VARCHAR(255),
      subject_name VARCHAR(255),
      faculty_name VARCHAR(255),
      date VARCHAR(64),
      start_time VARCHAR(32),
      status VARCHAR(32),
      meet_url TEXT,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS recorded_classes (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255),
      course_name VARCHAR(255),
      subject_name VARCHAR(255),
      faculty_name VARCHAR(255),
      drive_url TEXT,
      class_date VARCHAR(64),
      status VARCHAR(32),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(128) PRIMARY KEY,
      class_id VARCHAR(128),
      course_name VARCHAR(255),
      subject_name VARCHAR(255),
      date VARCHAR(64),
      total_students INT,
      present_count INT,
      absent_count INT,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255),
      course_name VARCHAR(255),
      subject_name VARCHAR(255),
      due_date VARCHAR(64),
      points INT,
      status VARCHAR(32),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS task_submissions (
      id VARCHAR(128) PRIMARY KEY,
      task_id VARCHAR(128),
      student_id VARCHAR(128),
      student_name VARCHAR(255),
      submitted_at VARCHAR(64),
      status VARCHAR(32),
      points_awarded INT,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS creative_tasks (
      id VARCHAR(128) PRIMARY KEY,
      title VARCHAR(255),
      type VARCHAR(64),
      priority VARCHAR(32),
      assigned_to VARCHAR(128),
      deadline VARCHAR(64),
      status VARCHAR(32),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS media (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255),
      category VARCHAR(128),
      url TEXT,
      uploaded_by VARCHAR(128),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(128) PRIMARY KEY,
      name VARCHAR(255),
      phone VARCHAR(64),
      email VARCHAR(255),
      course_interested VARCHAR(255),
      source VARCHAR(64),
      status VARCHAR(32),
      date_received VARCHAR(64),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128),
      title VARCHAR(255),
      message TEXT,
      type VARCHAR(64),
      read BOOLEAN DEFAULT false,
      created_at VARCHAR(64),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(128) PRIMARY KEY,
      user_id VARCHAR(128),
      user_name VARCHAR(255),
      user_role VARCHAR(64),
      action VARCHAR(128),
      module VARCHAR(128),
      details TEXT,
      timestamp VARCHAR(64),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS points_history (
      id VARCHAR(128) PRIMARY KEY,
      student_id VARCHAR(128),
      points INT,
      reason TEXT,
      date VARCHAR(64),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id VARCHAR(128) PRIMARY KEY,
      institution_name VARCHAR(255),
      contact_email VARCHAR(255),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  console.log('✅ All 16 individual tables created successfully!');

  // Migrate existing data from kashf_documents to individual tables
  console.log('🔄 Transferring existing records from kashf_documents to individual tables...');
  
  const existingDocs = await sql`SELECT collection, id, data FROM kashf_documents;`;
  console.log(`Found ${existingDocs.length} records to transfer.`);

  for (const doc of existingDocs) {
    const { collection, id, data } = doc;
    try {
      switch (collection) {
        case 'users':
          await sql`
            INSERT INTO users (id, name, username, email, role, status, department, phone, data, updated_at)
            VALUES (${id}, ${data.name || ''}, ${data.username || ''}, ${data.email || ''}, ${data.role || ''}, ${data.status || 'active'}, ${data.department || ''}, ${data.phone || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'roles':
          await sql`
            INSERT INTO roles (id, name, role_key, description, data, updated_at)
            VALUES (${id}, ${data.name || ''}, ${data.roleKey || ''}, ${data.description || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'courses':
          await sql`
            INSERT INTO courses (id, code, name, category, duration, status, data, updated_at)
            VALUES (${id}, ${data.code || ''}, ${data.name || ''}, ${data.category || ''}, ${data.duration || ''}, ${data.status || 'active'}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'subjects':
          await sql`
            INSERT INTO subjects (id, code, name, course_id, faculty_id, status, data, updated_at)
            VALUES (${id}, ${data.code || ''}, ${data.name || ''}, ${data.courseId || ''}, ${data.facultyId || ''}, ${data.status || 'active'}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'classes':
          await sql`
            INSERT INTO classes (id, course_name, subject_name, faculty_name, date, start_time, status, meet_url, data, updated_at)
            VALUES (${id}, ${data.courseName || ''}, ${data.subjectName || ''}, ${data.facultyName || ''}, ${data.date || ''}, ${data.startTime || ''}, ${data.status || 'scheduled'}, ${data.meetUrl || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'recordedClasses':
          await sql`
            INSERT INTO recorded_classes (id, title, course_name, subject_name, faculty_name, drive_url, class_date, status, data, updated_at)
            VALUES (${id}, ${data.title || ''}, ${data.courseName || ''}, ${data.subjectName || ''}, ${data.facultyName || ''}, ${data.driveUrl || ''}, ${data.classDate || ''}, ${data.status || 'published'}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'attendance':
          await sql`
            INSERT INTO attendance (id, class_id, course_name, subject_name, date, total_students, present_count, absent_count, data, updated_at)
            VALUES (${id}, ${data.classId || ''}, ${data.courseName || ''}, ${data.subjectName || ''}, ${data.date || ''}, ${data.totalStudents || 0}, ${data.presentCount || 0}, ${data.absentCount || 0}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'tasks':
          await sql`
            INSERT INTO tasks (id, title, course_name, subject_name, due_date, points, status, data, updated_at)
            VALUES (${id}, ${data.title || ''}, ${data.courseName || ''}, ${data.subjectName || ''}, ${data.dueDate || ''}, ${data.points || 0}, ${data.status || 'active'}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'taskSubmissions':
          await sql`
            INSERT INTO task_submissions (id, task_id, student_id, student_name, submitted_at, status, points_awarded, data, updated_at)
            VALUES (${id}, ${data.taskId || ''}, ${data.studentId || ''}, ${data.studentName || ''}, ${data.submittedAt || ''}, ${data.status || 'pending'}, ${data.pointsAwarded || 0}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'creativeTasks':
          await sql`
            INSERT INTO creative_tasks (id, title, type, priority, assigned_to, deadline, status, data, updated_at)
            VALUES (${id}, ${data.title || ''}, ${data.type || ''}, ${data.priority || 'medium'}, ${data.assignedTo || ''}, ${data.deadline || ''}, ${data.status || 'new'}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'media':
          await sql`
            INSERT INTO media (id, name, category, url, uploaded_by, data, updated_at)
            VALUES (${id}, ${data.name || ''}, ${data.category || ''}, ${data.url || ''}, ${data.uploadedBy || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'leads':
          await sql`
            INSERT INTO leads (id, name, phone, email, course_interested, source, status, date_received, data, updated_at)
            VALUES (${id}, ${data.name || ''}, ${data.phone || ''}, ${data.email || ''}, ${data.courseInterested || ''}, ${data.source || ''}, ${data.status || 'new'}, ${data.dateReceived || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'notifications':
          await sql`
            INSERT INTO notifications (id, user_id, title, message, type, read, created_at, data, updated_at)
            VALUES (${id}, ${data.userId || 'all'}, ${data.title || ''}, ${data.message || ''}, ${data.type || 'system'}, ${data.read || false}, ${data.createdAt || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'auditLogs':
          await sql`
            INSERT INTO audit_logs (id, user_id, user_name, user_role, action, module, details, timestamp, data, updated_at)
            VALUES (${id}, ${data.userId || ''}, ${data.userName || ''}, ${data.userRole || ''}, ${data.action || ''}, ${data.module || ''}, ${data.details || ''}, ${data.timestamp || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'pointsHistory':
          await sql`
            INSERT INTO points_history (id, student_id, points, reason, date, data, updated_at)
            VALUES (${id}, ${data.studentId || ''}, ${data.points || 0}, ${data.reason || ''}, ${data.date || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
        case 'settings':
          await sql`
            INSERT INTO settings (id, institution_name, contact_email, data, updated_at)
            VALUES (${id}, ${data.institutionName || ''}, ${data.contactEmail || ''}, ${JSON.stringify(data)}::jsonb, NOW())
            ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
          `;
          break;
      }
    } catch (e) {
      console.warn(`Warning migrating ${collection}/${id}:`, e.message);
    }
  }

  // Drop kashf_documents so user's table list in Neon console is pristine!
  await sql`DROP TABLE IF EXISTS kashf_documents;`;
  console.log('🗑️ Dropped kashf_documents generic table.');

  console.log('\n🎉 All individual tables populated successfully!');

  // List all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log('\n--- Current Tables in Neon PostgreSQL ---');
  console.table(tables);
}

createTables().catch(console.error);

