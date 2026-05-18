'use client';

import { useState, useEffect } from 'react';
import { DashboardStats, Monitor, Incident } from '@/types';
import { Activity, ArrowUpRight, ArrowDownRight, Globe, AlertCircle, Clock } from 'lucide-react';
import { formatResponseTime, formatUptime, timeAgo, cn, getStatusColor, getStatusBgColor, getStatusLabel, getStatusDotColor } from '@/lib/utils';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, monitorsRes, incidentsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/monitors'),
          fetch('/api/incidents') // We need to create this API route
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (monitorsRes.ok) setMonitors(await monitorsRes.json());
        if (incidentsRes.ok) {
          const allIncidents = await incidentsRes.json();
          setIncidents(allIncidents.filter((i: Incident) => i.status === 'ongoing'));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Overall Uptime" 
          value={stats ? formatUptime(stats.overallUptime) : '—'} 
          icon={<Activity className="w-4 h-4 text-brand-400" />}
          trend={stats && stats.overallUptime >= 99 ? 'good' : 'bad'}
        />
        <StatCard 
          title="Active Monitors" 
          value={stats ? `${stats.monitorsUp + stats.monitorsDown + stats.monitorsDegraded}` : '—'} 
          icon={<Globe className="w-4 h-4 text-brand-400" />}
        />
        <StatCard 
          title="Active Incidents" 
          value={stats ? `${stats.activeIncidents}` : '—'} 
          icon={<AlertCircle className="w-4 h-4 text-brand-400" />}
          trend={stats && stats.activeIncidents > 0 ? 'bad' : 'neutral'}
          valueClass={stats && stats.activeIncidents > 0 ? 'text-status-down' : ''}
        />
        <StatCard 
          title="Avg Response Time" 
          value={stats ? formatResponseTime(stats.avgResponseTime) : '—'} 
          icon={<Clock className="w-4 h-4 text-brand-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monitors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Monitors</h2>
            <Link href="/monitors" className="text-sm text-brand-400 hover:text-brand-300">View all</Link>
          </div>
          
          <div className="glass-panel overflow-hidden">
            {monitors.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No monitors added yet.</p>
                <Link href="/monitors/new" className="text-brand-400 hover:text-brand-300 mt-2 inline-block">
                  Add your first monitor
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {monitors.slice(0, 5).map(monitor => (
                  <li key={monitor.id} className="p-4 hover:bg-surface-2/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full", getStatusDotColor(monitor.status))}></div>
                      <div>
                        <Link href={`/monitors/${monitor.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">
                          {monitor.name}
                        </Link>
                        <div className="text-xs text-slate-500 mt-0.5">{monitor.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="hidden sm:block text-right">
                        <div className="text-slate-300">{formatUptime(monitor.uptime24h)}</div>
                        <div className="text-xs text-slate-500">24h Uptime</div>
                      </div>
                      <div className="hidden sm:block text-right w-16">
                        <div className="text-slate-300">{formatResponseTime(monitor.lastResponseTime)}</div>
                        <div className="text-xs text-slate-500">Ping</div>
                      </div>
                      <div className={cn("px-2.5 py-1 rounded-md text-xs font-medium border", getStatusColor(monitor.status), getStatusBgColor(monitor.status), "border-current/20")}>
                        {getStatusLabel(monitor.status)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Active Incidents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Incidents</h2>
          </div>
          
          <div className="space-y-3">
            {incidents.length === 0 ? (
              <div className="glass-panel p-6 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-status-up-bg flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-status-up" />
                </div>
                <p className="text-sm">All systems operational</p>
              </div>
            ) : (
              incidents.map(incident => (
                <div key={incident.id} className="glass-card p-4 border-l-4 border-l-status-down animate-slide-in-right">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{incident.monitorName} is Down</h3>
                      <p className="text-xs text-slate-400 mt-1">{incident.cause}</p>
                    </div>
                    <span className="text-xs text-slate-500">{timeAgo(incident.startedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, valueClass }: { title: string, value: string, icon: React.ReactNode, trend?: 'good' | 'bad' | 'neutral', valueClass?: string }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center border border-border-light">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className={cn("text-3xl font-bold tracking-tight text-white font-mono", valueClass)}>
          {value}
        </div>
        {trend && trend !== 'neutral' && (
          <div className={cn("flex items-center text-xs font-medium", trend === 'good' ? 'text-status-up' : 'text-status-down')}>
            {trend === 'good' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          </div>
        )}
      </div>
    </div>
  );
}
