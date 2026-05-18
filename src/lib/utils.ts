import { MonitorStatus } from '@/types';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStatusColor(status: MonitorStatus): string {
  switch (status) {
    case 'up': return 'text-status-up';
    case 'down': return 'text-status-down';
    case 'degraded': return 'text-status-degraded';
    case 'paused': return 'text-status-paused';
    case 'pending': return 'text-status-pending';
    default: return 'text-gray-400';
  }
}

export function getStatusBgColor(status: MonitorStatus): string {
  switch (status) {
    case 'up': return 'bg-status-up-bg';
    case 'down': return 'bg-status-down-bg';
    case 'degraded': return 'bg-status-degraded-bg';
    case 'paused': return 'bg-status-paused-bg';
    case 'pending': return 'bg-status-pending-bg';
    default: return 'bg-gray-800';
  }
}

export function getStatusDotColor(status: MonitorStatus): string {
  switch (status) {
    case 'up': return 'bg-status-up';
    case 'down': return 'bg-status-down';
    case 'degraded': return 'bg-status-degraded';
    case 'paused': return 'bg-status-paused';
    case 'pending': return 'bg-status-pending';
    default: return 'bg-gray-400';
  }
}

export function getStatusLabel(status: MonitorStatus): string {
  switch (status) {
    case 'up': return 'Operational';
    case 'down': return 'Down';
    case 'degraded': return 'Degraded';
    case 'paused': return 'Paused';
    case 'pending': return 'Pending';
    default: return 'Unknown';
  }
}

export function formatResponseTime(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatUptime(pct: number): string {
  return `${pct.toFixed(2)}%`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export function timeAgo(dateString: string | null): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getIntervalLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${seconds / 60}m`;
  return `${seconds / 3600}h`;
}
