export type MonitorStatus = 'up' | 'down' | 'degraded' | 'paused' | 'pending';
export type MonitorType = 'http' | 'https' | 'tcp' | 'dns' | 'ssl';
export type CheckInterval = 30 | 60 | 300 | 900 | 1800;
export type IncidentStatus = 'ongoing' | 'resolved';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Monitor {
  id: string;
  name: string;
  url: string;
  type: MonitorType;
  interval: CheckInterval;
  timeout: number;
  status: MonitorStatus;
  lastCheckAt: string | null;
  lastResponseTime: number | null;
  lastStatusCode: number | null;
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  avgResponseTime: number;
  sslExpiry: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPaused: boolean;
}

export interface Check {
  id: string;
  monitorId: string;
  status: MonitorStatus;
  responseTime: number;
  statusCode: number | null;
  error: string | null;
  checkedAt: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  type: 'down' | 'degraded' | 'ssl_expiry' | 'slow_response';
  status: IncidentStatus;
  severity: AlertSeverity;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
  cause: string;
  statusCode: number | null;
}

export interface DashboardStats {
  totalMonitors: number;
  monitorsUp: number;
  monitorsDown: number;
  monitorsDegraded: number;
  monitorsPaused: number;
  overallUptime: number;
  avgResponseTime: number;
  activeIncidents: number;
  checksToday: number;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  emailAddress: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  browserNotifications: boolean;
  alertOnDown: boolean;
  alertOnDegraded: boolean;
  alertOnRecovery: boolean;
  alertOnSslExpiry: boolean;
  sslExpiryDays: number;
}

export interface AppSettings {
  notifications: NotificationSettings;
  defaultInterval: CheckInterval;
  defaultTimeout: number;
  responseTimeThreshold: number;
}

export interface CheckHistoryPoint {
  time: string;
  responseTime: number;
  status: MonitorStatus;
}
