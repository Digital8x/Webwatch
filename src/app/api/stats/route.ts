import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { DashboardStats } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const monitors = db.getMonitors();
  const incidents = db.getActiveIncidents();
  const checksToday = db.getChecksToday();
  
  let monitorsUp = 0;
  let monitorsDown = 0;
  let monitorsDegraded = 0;
  let monitorsPaused = 0;
  let totalUptime = 0;
  let totalResponseTime = 0;
  let activeMonitorsCount = 0;

  for (const m of monitors) {
    if (m.isPaused || m.status === 'paused') {
      monitorsPaused++;
    } else {
      if (m.status === 'up') monitorsUp++;
      else if (m.status === 'down') monitorsDown++;
      else if (m.status === 'degraded') monitorsDegraded++;
      
      if (m.status !== 'pending') {
        totalUptime += m.uptime24h;
        totalResponseTime += m.avgResponseTime;
        activeMonitorsCount++;
      }
    }
  }

  const stats: DashboardStats = {
    totalMonitors: monitors.length,
    monitorsUp,
    monitorsDown,
    monitorsDegraded,
    monitorsPaused,
    overallUptime: activeMonitorsCount > 0 ? totalUptime / activeMonitorsCount : 100,
    avgResponseTime: activeMonitorsCount > 0 ? totalResponseTime / activeMonitorsCount : 0,
    activeIncidents: incidents.length,
    checksToday,
  };

  return NextResponse.json(stats);
}
