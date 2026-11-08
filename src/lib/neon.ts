import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_jEXaz7USAib2@ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

export function getSqlClient() {
  const connectionString = getDatabaseUrl();
  return neon(connectionString);
}

export const COLLECTION_TABLE_MAP: Record<string, string> = {
  users: 'users',
  roles: 'roles',
  courses: 'courses',
  subjects: 'subjects',
  classes: 'classes',
  recordedClasses: 'recorded_classes',
  attendance: 'attendance',
  tasks: 'tasks',
  taskSubmissions: 'task_submissions',
  creativeTasks: 'creative_tasks',
  media: 'media',
  leads: 'leads',
  notifications: 'notifications',
  auditLogs: 'audit_logs',
  pointsHistory: 'points_history',
  settings: 'settings',
};

const ALLOWED_TABLES = new Set(Object.values(COLLECTION_TABLE_MAP));

export function getTableName(collection: string): string {
  const table = COLLECTION_TABLE_MAP[collection] || collection.toLowerCase().replace(/([a-z])([A-Z])/g, '$1_$2');
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Invalid table name for collection: ${collection}`);
  }
  return table;
}

let isInitialized = false;

/**
 * Ensures all individual entity tables exist in Neon PostgreSQL.
 */
export async function initNeonDatabase() {
  if (isInitialized) return;
  const sql = getSqlClient();

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

  await sql`
    CREATE TABLE IF NOT EXISTS kashf_metadata (
      key VARCHAR(128) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  isInitialized = true;
}

export async function pingNeonDatabase() {
  const start = performance.now();
  const sql = getSqlClient();
  const result = await sql`SELECT 1 as alive, version(), current_database(), current_user;`;
  const latency = Math.round(performance.now() - start);
  return {
    connected: true,
    latency,
    database: result[0]?.current_database || 'neondb',
    user: result[0]?.current_user || 'neondb_owner',
    version: result[0]?.version || 'PostgreSQL 18',
  };
}

export async function getCollectionDocs<T = any>(collection: string): Promise<T[]> {
  await initNeonDatabase();
  const sql = getSqlClient();
  const table = getTableName(collection);
  const rows = await sql.query(`SELECT data FROM ${table} ORDER BY updated_at DESC;`);
  return rows.map((r: any) => r.data as T);
}

export async function getSingleDocument<T = any>(collection: string, id: string): Promise<T | null> {
  await initNeonDatabase();
  const sql = getSqlClient();
  const table = getTableName(collection);
  const rows = await sql.query(`SELECT data FROM ${table} WHERE id = $1 LIMIT 1;`, [id]);
  if (rows.length === 0) return null;
  return rows[0].data as T;
}

export async function upsertDocument(collection: string, id: string, data: any): Promise<void> {
  await initNeonDatabase();
  const sql = getSqlClient();
  const table = getTableName(collection);
  const dataJson = JSON.stringify(data);

  // Extract common top-level fields for relational columns
  const name = data.name || data.title || null;
  const email = data.email || null;
  const role = data.role || data.roleKey || null;
  const status = data.status || null;

  switch (table) {
    case 'users':
      await sql.query(
        `INSERT INTO users (id, name, username, email, role, status, department, phone, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           username = EXCLUDED.username,
           email = EXCLUDED.email,
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           department = EXCLUDED.department,
           phone = EXCLUDED.phone,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, name, data.username || null, email, role, status || 'active', data.department || null, data.phone || null, dataJson]
      );
      break;

    case 'leads':
      await sql.query(
        `INSERT INTO leads (id, name, phone, email, course_interested, source, status, date_received, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           course_interested = EXCLUDED.course_interested,
           source = EXCLUDED.source,
           status = EXCLUDED.status,
           date_received = EXCLUDED.date_received,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, name, data.phone || null, email, data.courseInterested || null, data.source || null, status || 'new', data.dateReceived || null, dataJson]
      );
      break;

    case 'courses':
      await sql.query(
        `INSERT INTO courses (id, code, name, category, duration, status, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           code = EXCLUDED.code,
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           duration = EXCLUDED.duration,
           status = EXCLUDED.status,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, data.code || null, name, data.category || null, data.duration || null, status || 'active', dataJson]
      );
      break;

    case 'tasks':
      await sql.query(
        `INSERT INTO tasks (id, title, course_name, subject_name, due_date, points, status, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           course_name = EXCLUDED.course_name,
           subject_name = EXCLUDED.subject_name,
           due_date = EXCLUDED.due_date,
           points = EXCLUDED.points,
           status = EXCLUDED.status,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, data.title || null, data.courseName || null, data.subjectName || null, data.dueDate || null, data.points || 0, status || 'active', dataJson]
      );
      break;

    case 'classes':
      await sql.query(
        `INSERT INTO classes (id, course_name, subject_name, faculty_name, date, start_time, status, meet_url, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           course_name = EXCLUDED.course_name,
           subject_name = EXCLUDED.subject_name,
           faculty_name = EXCLUDED.faculty_name,
           date = EXCLUDED.date,
           start_time = EXCLUDED.start_time,
           status = EXCLUDED.status,
           meet_url = EXCLUDED.meet_url,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, data.courseName || null, data.subjectName || null, data.facultyName || null, data.date || null, data.startTime || null, status || 'scheduled', data.meetUrl || null, dataJson]
      );
      break;

    case 'settings':
      await sql.query(
        `INSERT INTO settings (id, institution_name, contact_email, data, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           institution_name = EXCLUDED.institution_name,
           contact_email = EXCLUDED.contact_email,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, data.institutionName || null, data.contactEmail || null, dataJson]
      );
      break;

    case 'roles':
      await sql.query(
        `INSERT INTO roles (id, name, role_key, description, data, updated_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           role_key = EXCLUDED.role_key,
           description = EXCLUDED.description,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, name, data.roleKey || null, data.description || null, dataJson]
      );
      break;

    case 'subjects':
      await sql.query(
        `INSERT INTO subjects (id, code, name, course_id, faculty_id, status, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           code = EXCLUDED.code,
           name = EXCLUDED.name,
           course_id = EXCLUDED.course_id,
           faculty_id = EXCLUDED.faculty_id,
           status = EXCLUDED.status,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, data.code || null, name, data.courseId || null, data.facultyId || null, status || 'active', dataJson]
      );
      break;

    case 'attendance':
      await sql.query(
        `INSERT INTO attendance (id, class_id, course_name, subject_name, date, total_students, present_count, absent_count, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           class_id = EXCLUDED.class_id,
           course_name = EXCLUDED.course_name,
           subject_name = EXCLUDED.subject_name,
           date = EXCLUDED.date,
           total_students = EXCLUDED.total_students,
           present_count = EXCLUDED.present_count,
           absent_count = EXCLUDED.absent_count,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [
          id,
          data.classId || null,
          data.courseName || null,
          data.subjectName || null,
          data.date || null,
          data.totalStudents || 0,
          data.presentCount || 0,
          data.absentCount || 0,
          dataJson,
        ]
      );
      break;

    case 'recorded_classes':
      await sql.query(
        `INSERT INTO recorded_classes (id, title, course_name, subject_name, faculty_name, drive_url, class_date, status, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           course_name = EXCLUDED.course_name,
           subject_name = EXCLUDED.subject_name,
           faculty_name = EXCLUDED.faculty_name,
           drive_url = EXCLUDED.drive_url,
           class_date = EXCLUDED.class_date,
           status = EXCLUDED.status,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [
          id,
          data.title || null,
          data.courseName || null,
          data.subjectName || null,
          data.facultyName || null,
          data.driveUrl || null,
          data.classDate || null,
          status || 'published',
          dataJson,
        ]
      );
      break;

    case 'task_submissions':
      await sql.query(
        `INSERT INTO task_submissions (id, task_id, student_id, student_name, submitted_at, status, points_awarded, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           task_id = EXCLUDED.task_id,
           student_id = EXCLUDED.student_id,
           student_name = EXCLUDED.student_name,
           submitted_at = EXCLUDED.submitted_at,
           status = EXCLUDED.status,
           points_awarded = EXCLUDED.points_awarded,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [
          id,
          data.taskId || null,
          data.studentId || null,
          data.studentName || null,
          data.submittedAt || null,
          status || 'pending',
          data.pointsAwarded || 0,
          dataJson,
        ]
      );
      break;

    case 'creative_tasks':
      await sql.query(
        `INSERT INTO creative_tasks (id, title, type, priority, assigned_to, deadline, status, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           type = EXCLUDED.type,
           priority = EXCLUDED.priority,
           assigned_to = EXCLUDED.assigned_to,
           deadline = EXCLUDED.deadline,
           status = EXCLUDED.status,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [
          id,
          data.title || null,
          data.type || null,
          data.priority || 'medium',
          data.assignedTo || null,
          data.deadline || null,
          status || 'new',
          dataJson,
        ]
      );
      break;

    case 'media':
      await sql.query(
        `INSERT INTO media (id, name, category, url, uploaded_by, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           url = EXCLUDED.url,
           uploaded_by = EXCLUDED.uploaded_by,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, name, data.category || null, data.url || null, data.uploadedBy || null, dataJson]
      );
      break;

    case 'notifications':
      await sql.query(
        `INSERT INTO notifications (id, user_id, title, message, type, read, created_at, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           title = EXCLUDED.title,
           message = EXCLUDED.message,
           type = EXCLUDED.type,
           read = EXCLUDED.read,
           created_at = EXCLUDED.created_at,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [
          id,
          data.userId || 'all',
          data.title || null,
          data.message || null,
          data.type || 'system',
          data.read ?? false,
          data.createdAt || null,
          dataJson,
        ]
      );
      break;

    case 'audit_logs':
      await sql.query(
        `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, module, details, timestamp, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           user_name = EXCLUDED.user_name,
           user_role = EXCLUDED.user_role,
           action = EXCLUDED.action,
           module = EXCLUDED.module,
           details = EXCLUDED.details,
           timestamp = EXCLUDED.timestamp,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [
          id,
          data.userId || null,
          data.userName || null,
          data.userRole || null,
          data.action || null,
          data.module || null,
          data.details || null,
          data.timestamp || null,
          dataJson,
        ]
      );
      break;

    case 'points_history':
      await sql.query(
        `INSERT INTO points_history (id, student_id, points, reason, date, data, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           student_id = EXCLUDED.student_id,
           points = EXCLUDED.points,
           reason = EXCLUDED.reason,
           date = EXCLUDED.date,
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, data.studentId || null, data.points || 0, data.reason || null, data.date || null, dataJson]
      );
      break;

    default:
      // Generic individual table upsert with id and data
      await sql.query(
        `INSERT INTO ${table} (id, data, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           data = EXCLUDED.data,
           updated_at = NOW();`,
        [id, dataJson]
      );
      break;
  }
}

export async function upsertBatchDocuments(collection: string, items: any[]): Promise<void> {
  if (!items || items.length === 0) return;
  for (const item of items) {
    await upsertDocument(collection, String(item.id), item);
  }
}

export async function removeDocument(collection: string, id: string): Promise<void> {
  await initNeonDatabase();
  const sql = getSqlClient();
  const table = getTableName(collection);
  await sql.query(`DELETE FROM ${table} WHERE id = $1;`, [id]);
}

export async function getMetadataValue(key: string): Promise<any | null> {
  await initNeonDatabase();
  const sql = getSqlClient();
  const rows = await sql`
    SELECT value FROM kashf_metadata
    WHERE key = ${key}
    LIMIT 1;
  `;
  if (rows.length === 0) return null;
  return rows[0].value;
}

export async function setMetadataValue(key: string, value: any): Promise<void> {
  await initNeonDatabase();
  const sql = getSqlClient();
  const valJson = JSON.stringify(value);
  await sql`
    INSERT INTO kashf_metadata (key, value, updated_at)
    VALUES (${key}, ${valJson}::jsonb, NOW())
    ON CONFLICT (key)
    DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
  `;
}
