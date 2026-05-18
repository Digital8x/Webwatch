'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Clock, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewMonitor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'http',
    interval: 60,
    timeout: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Trigger an immediate check
        fetch('/api/checks/run', { method: 'POST' });
        router.push('/monitors');
      } else {
        alert('Failed to create monitor');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/monitors" className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center text-slate-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Add New Monitor</h1>
          <p className="text-sm text-slate-400">Configure a new website to track uptime and performance.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Monitor Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. My Personal Blog"
              className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">URL to monitor</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                required
                type="url" 
                placeholder="https://example.com"
                className="w-full bg-surface-2 border border-border-light rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Check Interval</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select 
                className="w-full bg-surface-2 border border-border-light rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                value={formData.interval}
                onChange={e => setFormData({...formData, interval: parseInt(e.target.value)})}
              >
                <option value={30}>30 Seconds</option>
                <option value={60}>1 Minute</option>
                <option value={300}>5 Minutes</option>
                <option value={900}>15 Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Timeout</label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select 
                className="w-full bg-surface-2 border border-border-light rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                value={formData.timeout}
                onChange={e => setFormData({...formData, timeout: parseInt(e.target.value)})}
              >
                <option value={10}>10 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <Link href="/monitors" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            Save Monitor
          </button>
        </div>
      </form>
    </div>
  );
}
