'use client';

import { Bell, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNav() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard Overview';
    if (pathname === '/monitors') return 'All Monitors';
    if (pathname?.startsWith('/monitors/')) return 'Monitor Details';
    if (pathname === '/incidents') return 'Incidents Timeline';
    if (pathname === '/settings') return 'Settings';
    return 'WebWatch Pro';
  };

  return (
    <header className="h-16 border-b border-border bg-surface-1/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-xl font-semibold text-white tracking-tight">{getPageTitle()}</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search monitors (Cmd+K)" 
            className="bg-surface-2 border border-border-light rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-500 transition-colors w-64 text-slate-200 placeholder:text-slate-500"
          />
        </div>
        
        <Link 
          href="/monitors/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Monitor</span>
        </Link>
        
        <Link 
          href="/incidents"
          className="w-9 h-9 rounded-full bg-surface-2 border border-border-light flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-3 transition-colors relative"
          title="View Incidents"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-status-degraded rounded-full border border-surface-2"></span>
        </Link>
      </div>
    </header>
  );
}
