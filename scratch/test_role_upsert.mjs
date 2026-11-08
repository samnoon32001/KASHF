import { upsertDocument, getSingleDocument } from './src/lib/neon.ts';

async function testUpsert() {
  try {
    console.log("Testing upsertDocument for roles...");
    await upsertDocument('roles', 'role-telecaller', {
      id: 'role-telecaller',
      name: 'Telecaller',
      roleKey: 'telecaller',
      permissions: ['leads.view', 'leads.create'],
    });
    console.log("Upsert succeeded!");
    const doc = await getSingleDocument('roles', 'role-telecaller');
    console.log("Retrieved:", doc);
  } catch (err) {
    console.error("Upsert error:", err);
  }
}

testUpsert();
