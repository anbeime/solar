import { NextResponse } from 'next/server';
import { smartSearch } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { query, data, topK } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query' },
        { status: 400 },
      );
    }

    const results = await smartSearch(
      query,
      data || [],
      topK || 10,
    );

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    return NextResponse.json(
      { error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}
