import { NextRequest, NextResponse } from 'next/server';
import { getMetadataValue, setMetadataValue } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Key query parameter required' }, { status: 400 });
    }
    const value = await getMetadataValue(key);
    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }
    await setMetadataValue(key, value);
    return NextResponse.json({ success: true, message: 'Metadata updated', key });
  } catch (error: any) {
    console.error('Error saving metadata:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save metadata' },
      { status: 500 }
    );
  }
}

