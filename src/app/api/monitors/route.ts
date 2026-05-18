import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Monitor } from '@/types';

export async function GET() {
  const monitors = db.getMonitors();
  return NextResponse.json(monitors);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.url || !body.name) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    const newMonitor: Monitor = {
      id: uuidv4(),
      name: body.name,
      url: body.url,
      type: body.type || 'http',
      interval: body.interval || 60,
      timeout: body.timeout || 30,
      status: 'pending',
      lastCheckAt: null,
      lastResponseTime: null,
      lastStatusCode: null,
      uptime24h: 100,
      uptime7d: 100,
      uptime30d: 100,
      avgResponseTime: 0,
      sslExpiry: null,
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPaused: false,
    };

    db.createMonitor(newMonitor);
    return NextResponse.json(newMonitor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
