import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const monitor = db.getMonitor(params.id);
  if (!monitor) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Also fetch recent checks and incidents for this monitor
  const checks = db.getChecksByMonitor(params.id, 100);
  const incidents = db.getIncidentsByMonitor(params.id);

  return NextResponse.json({
    ...monitor,
    checks,
    incidents
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = db.updateMonitor(params.id, body);
    
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const success = db.deleteMonitor(params.id);
  if (!success) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
