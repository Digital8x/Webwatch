'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MonitorSmartphone, ShieldAlert, Loader2 } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
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
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: any, category?: string) => {
    setSettings((prev: any) => {
      if (category) {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [field]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-brand-500" /></div>;
  }

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
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.notifications.browserNotifications}
                    onChange={(e) => handleChange('browserNotifications', e.target.checked, 'notifications')}
                  />
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
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={settings.notifications.emailEnabled}
                    onChange={(e) => handleChange('emailEnabled', e.target.checked, 'notifications')}
                  />
                  <div className="w-11 h-6 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
              
              <div className={`space-y-4 ${settings.notifications.emailEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">To Email Address (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="you@example.com, team@example.com" 
                    value={settings.notifications.emailAddress}
                    onChange={(e) => handleChange('emailAddress', e.target.value, 'notifications')}
                    className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Host</label>
                    <input 
                      type="text" 
                      placeholder="smtp.gmail.com" 
                      value={settings.notifications.smtpHost}
                      onChange={(e) => handleChange('smtpHost', e.target.value, 'notifications')}
                      className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Port</label>
                    <input 
                      type="number" 
                      placeholder="587" 
                      value={settings.notifications.smtpPort}
                      onChange={(e) => handleChange('smtpPort', parseInt(e.target.value) || 587, 'notifications')}
                      className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Username</label>
                    <input 
                      type="text" 
                      placeholder="user@example.com" 
                      value={settings.notifications.smtpUser || ''}
                      onChange={(e) => handleChange('smtpUser', e.target.value, 'notifications')}
                      className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">SMTP Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={settings.notifications.smtpPass || ''}
                      onChange={(e) => handleChange('smtpPass', e.target.value, 'notifications')}
                      className="w-full bg-surface-2 border border-border-light rounded-lg px-4 py-2 text-white" 
                    />
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
          <AlertToggle 
            title="Monitor goes down" 
            description="When a check returns 500+ or times out" 
            checked={settings.notifications.alertOnDown}
            onChange={(c) => handleChange('alertOnDown', c, 'notifications')}
          />
          <AlertToggle 
            title="Performance degraded" 
            description={`When response time exceeds ${settings.responseTimeThreshold}ms`}
            checked={settings.notifications.alertOnDegraded}
            onChange={(c) => handleChange('alertOnDegraded', c, 'notifications')}
          />
          <AlertToggle 
            title="Monitor recovers" 
            description="When an active incident is resolved" 
            checked={settings.notifications.alertOnRecovery}
            onChange={(c) => handleChange('alertOnRecovery', c, 'notifications')}
          />
          <AlertToggle 
            title="SSL Certificate Expiry" 
            description={`Within ${settings.notifications.sslExpiryDays} days before expiry`}
            checked={settings.notifications.alertOnSslExpiry}
            onChange={(c) => handleChange('alertOnSslExpiry', c, 'notifications')}
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function AlertToggle({ title, description, checked, onChange }: { title: string, description: string, checked: boolean, onChange: (checked: boolean) => void }) {
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
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-9 h-5 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
      </label>
    </div>
  );
}
