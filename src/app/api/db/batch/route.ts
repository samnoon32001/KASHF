import { NextRequest, NextResponse } from 'next/server';
import { upsertBatchDocuments } from '@/lib/neon';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection, items } = body;

    if (!collection || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Collection and items array are required' },
        { status: 400 }
      );
    }

    await upsertBatchDocuments(collection, items);
    return NextResponse.json({
      success: true,
      message: `Batch upserted ${items.length} items to ${collection}`,
      count: items.length,
    });
  } catch (error: any) {
    console.error('Error in batch upsert:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Batch upsert failed' },
      { status: 500 }
    );
  }
}

