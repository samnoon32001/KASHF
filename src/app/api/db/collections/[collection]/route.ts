import { NextRequest, NextResponse } from 'next/server';
import { getCollectionDocs, upsertDocument } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }
    const docs = await getCollectionDocs(collection);
    return NextResponse.json({ success: true, collection, data: docs });
  } catch (error: any) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }
    const body = await request.json();
    if (!body || !body.id) {
      return NextResponse.json({ error: 'Payload must have an id field' }, { status: 400 });
    }
    await upsertDocument(collection, String(body.id), body);
    return NextResponse.json({ success: true, message: 'Document saved', id: body.id });
  } catch (error: any) {
    console.error('Error saving document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save document' },
      { status: 500 }
    );
  }
}

