import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/db';
import { AppSettings } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const updates: Partial<AppSettings> = await req.json();
    const newSettings = updateSettings(updates);
    return NextResponse.json(newSettings);
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
