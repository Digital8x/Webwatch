'use client';

import { useState, useEffect } from 'react';
import { Incident } from '@/types';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { formatDuration, timeAgo } from '@/lib/utils';
import Link from 'next/link';

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) setIncidents(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Incidents Timeline</h1>
        <p className="text-sm text-slate-400 mt-1">History of all downtime and performance degradation events.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : incidents.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-status-up opacity-20" />
            <h3 className="text-lg font-medium text-white mb-2">No incidents to report</h3>
            <p className="max-w-sm mx-auto">Your monitors have been running smoothly with no recorded downtime.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {incidents.map(incident => (
              <li key={incident.id} className="p-6 hover:bg-surface-2/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                    incident.status === 'ongoing' 
                      ? 'bg-gradient-to-br from-status-down to-rose-700 text-white shadow-status-down/20' 
                      : 'bg-surface-3 text-slate-400 border border-border'
                  }`}>
                    {incident.status === 'ongoing' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/monitors/${incident.monitorId}`} className="font-semibold text-lg text-white hover:text-brand-400 transition-colors">
                            {incident.monitorName}
                          </Link>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            incident.status === 'ongoing' ? 'bg-status-down/20 text-status-down' : 'bg-surface-3 text-slate-400'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                        <p className="text-slate-300">{incident.cause}</p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        {timeAgo(incident.startedAt)}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-2/50 border border-border-light">
                      <div>
                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Started</div>
                        <div className="text-sm text-slate-300 font-mono">{new Date(incident.startedAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Resolved</div>
                        <div className="text-sm text-slate-300 font-mono">{incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Duration</div>
                        <div className="text-sm text-slate-300 font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {incident.duration !== null ? formatDuration(incident.duration) : 'Ongoing'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
