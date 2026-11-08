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

async function backfillColumns() {
  console.log("Backfilling relational columns from data json in all tables...");

  // 1. audit_logs
  await sql`
    UPDATE audit_logs SET
      user_id = COALESCE(user_id, data->>'userId'),
      user_name = COALESCE(user_name, data->>'userName'),
      user_role = COALESCE(user_role, data->>'userRole'),
      action = COALESCE(action, data->>'action'),
      module = COALESCE(module, data->>'module'),
      details = COALESCE(details, data->>'details'),
      timestamp = COALESCE(timestamp, data->>'timestamp')
    WHERE user_name IS NULL;
  `;
  console.log("audit_logs backfilled!");

  // 2. roles
  await sql`
    UPDATE roles SET
      name = COALESCE(name, data->>'name'),
      role_key = COALESCE(role_key, data->>'roleKey'),
      description = COALESCE(description, data->>'description')
    WHERE name IS NULL;
  `;
  console.log("roles backfilled!");

  // 3. subjects
  await sql`
    UPDATE subjects SET
      code = COALESCE(code, data->>'code'),
      name = COALESCE(name, data->>'name'),
      course_id = COALESCE(course_id, data->>'courseId'),
      faculty_id = COALESCE(faculty_id, data->>'facultyId'),
      status = COALESCE(status, data->>'status')
    WHERE name IS NULL;
  `;
  console.log("subjects backfilled!");

  // 4. attendance
  await sql`
    UPDATE attendance SET
      class_id = COALESCE(class_id, data->>'classId'),
      course_name = COALESCE(course_name, data->>'courseName'),
      subject_name = COALESCE(subject_name, data->>'subjectName'),
      date = COALESCE(date, data->>'date'),
      total_students = COALESCE(total_students, (data->>'totalStudents')::int),
      present_count = COALESCE(present_count, (data->>'presentCount')::int),
      absent_count = COALESCE(absent_count, (data->>'absentCount')::int)
    WHERE course_name IS NULL;
  `;
  console.log("attendance backfilled!");

  // 5. creative_tasks
  await sql`
    UPDATE creative_tasks SET
      title = COALESCE(title, data->>'title'),
      type = COALESCE(type, data->>'type'),
      priority = COALESCE(priority, data->>'priority'),
      assigned_to = COALESCE(assigned_to, data->>'assignedTo'),
      deadline = COALESCE(deadline, data->>'deadline'),
      status = COALESCE(status, data->>'status')
    WHERE title IS NULL;
  `;
  console.log("creative_tasks backfilled!");

  // 6. notifications
  await sql`
    UPDATE notifications SET
      user_id = COALESCE(user_id, data->>'userId'),
      title = COALESCE(title, data->>'title'),
      message = COALESCE(message, data->>'message'),
      type = COALESCE(type, data->>'type'),
      read = COALESCE(read, (data->>'read')::boolean),
      created_at = COALESCE(created_at, data->>'createdAt')
    WHERE title IS NULL;
  `;
  console.log("notifications backfilled!");

  // 7. points_history
  await sql`
    UPDATE points_history SET
      student_id = COALESCE(student_id, data->>'studentId'),
      points = COALESCE(points, (data->>'points')::int),
      reason = COALESCE(reason, data->>'reason'),
      date = COALESCE(date, data->>'date')
    WHERE reason IS NULL;
  `;
  console.log("points_history backfilled!");

  // Verify audit_logs
  const sampleLog = await sql`SELECT id, user_name, action, details, timestamp FROM audit_logs LIMIT 3;`;
  console.log("Sample audit logs after backfill:");
  console.table(sampleLog);
}

backfillColumns().catch(console.error);
