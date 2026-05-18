'use client';

import { Bell, Mail, MonitorSmartphone, ShieldAlert } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure your personal monitoring preferences and alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="text-sm font-semibold text-white uppercase tracking-wider">Notifications</div>
          <p className="text-sm text-slate-400">Configure how you want to be alerted when a monitor goes down.</p>
        </div>
        
        <div className="md:col-span-2 glass-panel p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
              <MonitorSmartphone className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-white">Desktop Notifications</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Receive browser push notifications when incidents occur.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-border"></div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-medium text-white">Email Alerts</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Send alerts via local SMTP server.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
              
              <div className="space-y-4 opacity-50 pointer-events-none">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">To Email Address</label>
                  <input type="email" placeholder="you@example.com" className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Host</label>
                    <input type="text" placeholder="smtp.gmail.com" className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Port</label>
                    <input type="text" placeholder="587" className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-border my-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="text-sm font-semibold text-white uppercase tracking-wider">Alert Rules</div>
          <p className="text-sm text-slate-400">Choose which events should trigger notifications.</p>
        </div>
        
        <div className="md:col-span-2 glass-panel p-6 space-y-4">
          <AlertToggle title="Monitor goes down" description="When a check returns 500+ or times out" defaultChecked />
          <AlertToggle title="Performance degraded" description="When response time exceeds 2000ms" defaultChecked />
          <AlertToggle title="Monitor recovers" description="When an active incident is resolved" defaultChecked />
          <AlertToggle title="SSL Certificate Expiry" description="14 days before certificate expires" defaultChecked={false} />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-500/20">
          Save Settings
        </button>
      </div>
    </div>
  );
}

function AlertToggle({ title, description, defaultChecked }: { title: string, description: string, defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-surface-2/50 border border-border-light">
      <div className="flex gap-3">
        <ShieldAlert className="w-5 h-5 text-slate-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-9 h-5 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
      </label>
    </div>
  );
}
