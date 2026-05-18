import { NextResponse } from 'next/server';
import { checkAllMonitors } from '@/lib/checker';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const results = await checkAllMonitors();
    return NextResponse.json({ success: true, checks: results.length });
  } catch (error) {
    console.error('Failed to run checks:', error);
    return NextResponse.json({ error: 'Failed to run checks' }, { status: 500 });
  }
}
