'use client';

import { useEffect } from 'react';

export default function BackgroundRunner() {
  useEffect(() => {
    // Run immediately on mount
    fetch('/api/checks/run', { method: 'POST' }).catch(console.error);

    // Then run every 60 seconds
    const interval = setInterval(() => {
      fetch('/api/checks/run', { method: 'POST' }).catch(console.error);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null; // Hidden component
}
