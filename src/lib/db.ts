import fs from 'fs';
import path from 'path';
import { Monitor, Check, Incident, AppSettings } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
  }
  return defaultValue;
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Monitors ──────────────────────────────────────────────────────────

export function getMonitors(): Monitor[] {
  return readJSON<Monitor[]>('monitors.json', []);
}

export function getMonitor(id: string): Monitor | undefined {
  return getMonitors().find(m => m.id === id);
}

export function createMonitor(monitor: Monitor): Monitor {
  const monitors = getMonitors();
  monitors.push(monitor);
  writeJSON('monitors.json', monitors);
  return monitor;
}

export function updateMonitor(id: string, updates: Partial<Monitor>): Monitor | null {
  const monitors = getMonitors();
  const idx = monitors.findIndex(m => m.id === id);
  if (idx === -1) return null;
  monitors[idx] = { ...monitors[idx], ...updates, updatedAt: new Date().toISOString() };
  writeJSON('monitors.json', monitors);
  return monitors[idx];
}

export function deleteMonitor(id: string): boolean {
  const monitors = getMonitors();
  const filtered = monitors.filter(m => m.id !== id);
  if (filtered.length === monitors.length) return false;
  writeJSON('monitors.json', filtered);
  // Also clean up related checks and incidents
  const checks = getChecks().filter(c => c.monitorId !== id);
  writeJSON('checks.json', checks);
  const incidents = getIncidents().filter(i => i.monitorId !== id);
  writeJSON('incidents.json', incidents);
  return true;
}

// ── Checks ────────────────────────────────────────────────────────────

export function getChecks(): Check[] {
  return readJSON<Check[]>('checks.json', []);
}

export function getChecksByMonitor(monitorId: string, limit?: number): Check[] {
  let checks = getChecks().filter(c => c.monitorId === monitorId);
  checks.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
  if (limit) checks = checks.slice(0, limit);
  return checks;
}

export function addCheck(check: Check): void {
  const checks = getChecks();
  checks.push(check);
  // Keep max 10000 checks per monitor (trim old ones)
  const monitorChecks = checks.filter(c => c.monitorId === check.monitorId);
  if (monitorChecks.length > 10000) {
    monitorChecks.sort((a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime());
    const toRemove = new Set(monitorChecks.slice(0, monitorChecks.length - 10000).map(c => c.id));
    const trimmed = checks.filter(c => !toRemove.has(c.id));
    writeJSON('checks.json', trimmed);
  } else {
    writeJSON('checks.json', checks);
  }
}

export function getChecksToday(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getChecks().filter(c => new Date(c.checkedAt) >= today).length;
}

// ── Incidents ─────────────────────────────────────────────────────────

export function getIncidents(): Incident[] {
  const incidents = readJSON<Incident[]>('incidents.json', []);
  incidents.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  return incidents;
}

export function getActiveIncidents(): Incident[] {
  return getIncidents().filter(i => i.status === 'ongoing');
}

export function getIncidentsByMonitor(monitorId: string): Incident[] {
  return getIncidents().filter(i => i.monitorId === monitorId);
}

export function createIncident(incident: Incident): void {
  const incidents = getIncidents();
  incidents.push(incident);
  writeJSON('incidents.json', incidents);
}

export function resolveIncident(monitorId: string): void {
  const incidents = getIncidents();
  const ongoing = incidents.find(i => i.monitorId === monitorId && i.status === 'ongoing');
  if (ongoing) {
    ongoing.status = 'resolved';
    ongoing.resolvedAt = new Date().toISOString();
    ongoing.duration = Math.floor(
      (new Date(ongoing.resolvedAt).getTime() - new Date(ongoing.startedAt).getTime()) / 1000
    );
    writeJSON('incidents.json', incidents);
  }
}

// ── Settings ──────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    emailEnabled: false,
    emailAddress: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    browserNotifications: true,
    alertOnDown: true,
    alertOnDegraded: true,
    alertOnRecovery: true,
    alertOnSslExpiry: true,
    sslExpiryDays: 14,
  },
  defaultInterval: 60,
  defaultTimeout: 30,
  responseTimeThreshold: 2000,
};

export function getSettings(): AppSettings {
  return readJSON<AppSettings>('settings.json', DEFAULT_SETTINGS);
}

export function updateSettings(updates: Partial<AppSettings>): AppSettings {
  const settings = { ...getSettings(), ...updates };
  writeJSON('settings.json', settings);
  return settings;
}

// ── Uptime Calculations ──────────────────────────────────────────────

export function calculateUptime(monitorId: string, hours: number): number {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const checks = getChecks().filter(
    c => c.monitorId === monitorId && new Date(c.checkedAt) >= since
  );
  if (checks.length === 0) return 100;
  const upChecks = checks.filter(c => c.status === 'up').length;
  return (upChecks / checks.length) * 100;
}
