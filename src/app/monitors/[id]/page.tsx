'use client';

import { useState, useEffect } from 'react';
import { Monitor, Check, Incident } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Clock, Activity, AlertTriangle, Shield, CheckCircle2, PauseCircle, Trash2, Edit3 } from 'lucide-react';
import { formatResponseTime, formatUptime, timeAgo, formatDuration, getStatusColor, getStatusBgColor, getStatusLabel, getStatusDotColor } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonitorDetail({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ monitor: Monitor; checks: Check[]; incidents: Incident[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/monitors/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setData({
          monitor: json,
          checks: json.checks,
          incidents: json.incidents
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading && !data) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;
  }

  if (!data || !data.monitor) {
    return <div className="p-12 text-center text-slate-400">Monitor not found.</div>;
  }

  const { monitor, checks, incidents } = data;

  const chartData = [...checks].reverse().map(c => ({
    time: new Date(c.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fullTime: new Date(c.checkedAt).toLocaleString(),
    responseTime: c.responseTime,
    status: c.status
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/monitors" className="mt-1 w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-slate-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">{monitor.name}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium border border-current/20 ${getStatusColor(monitor.status)} ${getStatusBgColor(monitor.status)}`}>
                {getStatusLabel(monitor.status)}
              </span>
            </div>
            <a href={monitor.url} target="_blank" rel="noreferrer" className="text-sm text-brand-400 hover:underline">{monitor.url}</a>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-light text-slate-300 hover:text-white hover:bg-surface-3 transition-colors text-sm font-medium flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="text-sm text-slate-400 mb-1 flex items-center gap-1.5"><Activity className="w-4 h-4" /> 24h Uptime</div>
          <div className="text-2xl font-bold text-white font-mono">{formatUptime(monitor.uptime24h)}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm text-slate-400 mb-1 flex items-center gap-1.5"><Activity className="w-4 h-4" /> 30d Uptime</div>
          <div className="text-2xl font-bold text-white font-mono">{formatUptime(monitor.uptime30d)}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm text-slate-400 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Avg Ping</div>
          <div className="text-2xl font-bold text-white font-mono">{formatResponseTime(monitor.avgResponseTime)}</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-sm text-slate-400 mb-1 flex items-center gap-1.5"><Shield className="w-4 h-4" /> Last Checked</div>
          <div className="text-lg font-bold text-white mt-1">{timeAgo(monitor.lastCheckAt)}</div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Response Time (Last 100 Checks)</h2>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}ms`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#1e2a4a', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  formatter={(value: number) => [`${value}ms`, 'Response Time']}
                  labelFormatter={(label, payload) => payload[0]?.payload.fullTime || label}
                />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', stroke: '#050810', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">No data available yet.</div>
          )}
        </div>
      </div>

      {/* Incident History */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Incident History</h2>
        </div>
        {incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-status-up opacity-20" />
            <p>No incidents recorded for this monitor.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {incidents.map(incident => (
              <li key={incident.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${incident.status === 'ongoing' ? 'bg-status-down-bg text-status-down' : 'bg-surface-3 text-slate-400'}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white mb-1">
                        {incident.status === 'ongoing' ? 'Currently Down' : 'Resolved Incident'}
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{incident.cause}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                        <span>Started: {new Date(incident.startedAt).toLocaleString()}</span>
                        {incident.resolvedAt && (
                          <span>Resolved: {new Date(incident.resolvedAt).toLocaleString()}</span>
                        )}
                        {incident.duration !== null && (
                          <span>Duration: {formatDuration(incident.duration)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${incident.status === 'ongoing' ? 'border-status-down text-status-down bg-status-down-bg' : 'border-slate-700 text-slate-400 bg-surface-2'}`}>
                    {incident.status.toUpperCase()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
