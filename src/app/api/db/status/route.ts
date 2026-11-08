import { NextResponse } from 'next/server';
import { pingNeonDatabase } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await pingNeonDatabase();
    return NextResponse.json({
      success: true,
      connected: true,
      provider: 'Neon PostgreSQL (Serverless)',
      host: 'ep-polished-dawn-azf4nchi-pooler.c-3.ap-southeast-1.aws.neon.tech',
      region: 'AWS ap-southeast-1 (Singapore)',
      pooler: 'Active (PgBouncer/Neon Pooler)',
      database: status.database,
      version: status.version,
      latency: status.latency,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Neon Status Check Failed:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message || 'Database connection error',
        provider: 'Neon PostgreSQL (Serverless)',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

