import { Monitor, Check, Incident, MonitorStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as db from './db';

async function performHttpCheck(url: string, timeout: number) {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'WebWatch-Pro/1.0' },
    });
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const statusCode = response.status;
    let status: MonitorStatus = 'up';
    if (statusCode >= 500) status = 'down';
    else if (statusCode >= 400) status = 'degraded';
    else if (responseTime > 2000) status = 'degraded';
    return { status, responseTime, statusCode, error: null, sslExpiry: null };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    let error = 'Connection failed';
    if (err.name === 'AbortError') error = `Timeout after ${timeout}s`;
    else if (err.cause?.code === 'ENOTFOUND') error = 'DNS resolution failed';
    else if (err.cause?.code === 'ECONNREFUSED') error = 'Connection refused';
    else if (err.cause?.code === 'ECONNRESET') error = 'Connection reset';
    else if (err.message) error = err.message;
    return { status: 'down' as MonitorStatus, responseTime, statusCode: null, error, sslExpiry: null };
  }
}

export async function checkMonitor(monitor: Monitor) {
  const previousStatus = monitor.status;
  const result = await performHttpCheck(monitor.url, monitor.timeout);
  const check: Check = {
    id: uuidv4(), monitorId: monitor.id, status: result.status,
    responseTime: result.responseTime, statusCode: result.statusCode,
    error: result.error, checkedAt: new Date().toISOString(),
  };
  db.addCheck(check);

  const uptime24h = db.calculateUptime(monitor.id, 24);
  const uptime7d = db.calculateUptime(monitor.id, 168);
  const uptime30d = db.calculateUptime(monitor.id, 720);
  const recentChecks = db.getChecksByMonitor(monitor.id, 100);
  const validChecks = recentChecks.filter(c => c.status !== 'down');
  const avgResponseTime = validChecks.length > 0
    ? validChecks.reduce((sum, c) => sum + c.responseTime, 0) / validChecks.length : 0;

  db.updateMonitor(monitor.id, {
    status: result.status, lastCheckAt: check.checkedAt,
    lastResponseTime: result.responseTime, lastStatusCode: result.statusCode,
    uptime24h, uptime7d, uptime30d, avgResponseTime: Math.round(avgResponseTime),
  });

  if (result.status === 'down' && previousStatus !== 'down') {
    db.createIncident({
      id: uuidv4(), monitorId: monitor.id, monitorName: monitor.name,
      monitorUrl: monitor.url, type: 'down', status: 'ongoing', severity: 'critical',
      startedAt: new Date().toISOString(), resolvedAt: null, duration: null,
      cause: result.error || `HTTP ${result.statusCode}`, statusCode: result.statusCode,
    });
  } else if (result.status === 'up' && (previousStatus === 'down' || previousStatus === 'degraded')) {
    db.resolveIncident(monitor.id);
  }
  return { check, previousStatus };
}

export async function checkAllMonitors() {
  const monitors = db.getMonitors().filter(m => !m.isPaused);
  const checks: Check[] = [];
  for (const monitor of monitors) {
    try {
      const { check } = await checkMonitor(monitor);
      checks.push(check);
    } catch (err) { console.error(`Error checking ${monitor.name}:`, err); }
  }
  return checks;
}
