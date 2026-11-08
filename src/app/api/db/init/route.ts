import { NextResponse } from 'next/server';
import { initNeonDatabase, pingNeonDatabase } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initNeonDatabase();
    const ping = await pingNeonDatabase();
    return NextResponse.json({
      success: true,
      message: 'Neon PostgreSQL schema initialized successfully.',
      ping,
    });
  } catch (error: any) {
    console.error('Neon Init Failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Initialization failed' },
      { status: 500 }
    );
  }
}

