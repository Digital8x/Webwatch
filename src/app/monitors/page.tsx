'use client';

import { useState, useEffect } from 'react';
import { Monitor } from '@/types';
import Link from 'next/link';
import { Plus, Globe, MoreVertical, Play, Pause, Trash } from 'lucide-react';
import { formatResponseTime, formatUptime, timeAgo, cn, getStatusColor, getStatusBgColor, getStatusLabel, getStatusDotColor } from '@/lib/utils';

export default function Monitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonitors = async () => {
    try {
      const res = await fetch('/api/monitors', { cache: 'no-store' });
      if (res.ok) setMonitors(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 10000);
    return () => clearInterval(interval);
  }, []);

  const togglePause = async (id: string, current: boolean) => {
    await fetch(`/api/monitors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaused: !current, status: !current ? 'paused' : 'pending' })
    });
    fetchMonitors();
  };

  const deleteMonitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this monitor? All history will be lost.')) return;
    await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
    fetchMonitors();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Monitors</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and view status of all your configured endpoints.</p>
        </div>
        <Link 
          href="/monitors/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Monitor
        </Link>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : monitors.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-white mb-2">No monitors found</h3>
            <p className="max-w-sm mx-auto mb-6">You haven't added any websites to monitor yet. Get started by adding your first monitor.</p>
            <Link href="/monitors/new" className="bg-surface-3 hover:bg-surface-4 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors inline-block">
              Add your first monitor
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-2 text-slate-400 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Name & URL</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Response Time</th>
                  <th className="px-6 py-3 font-medium">24h Uptime</th>
                  <th className="px-6 py-3 font-medium">Last Checked</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monitors.map(monitor => (
                  <tr key={monitor.id} className="hover:bg-surface-2/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", getStatusDotColor(monitor.status))}></div>
                        <div>
                          <Link href={`/monitors/${monitor.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">
                            {monitor.name}
                          </Link>
                          <div className="text-xs text-slate-500 mt-0.5">{monitor.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-md text-xs font-medium border", getStatusColor(monitor.status), getStatusBgColor(monitor.status), "border-current/20")}>
                        {getStatusLabel(monitor.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {formatResponseTime(monitor.lastResponseTime)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatUptime(monitor.uptime24h)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {timeAgo(monitor.lastCheckAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => togglePause(monitor.id, monitor.isPaused)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-surface-3 rounded transition-colors"
                          title={monitor.isPaused ? "Resume" : "Pause"}
                        >
                          {monitor.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => deleteMonitor(monitor.id)}
                          className="p-1.5 text-slate-400 hover:text-status-down hover:bg-status-down-bg rounded transition-colors"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
