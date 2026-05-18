import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const incidents = db.getIncidents();
  return NextResponse.json(incidents);
}
