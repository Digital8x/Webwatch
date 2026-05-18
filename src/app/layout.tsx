import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import BackgroundRunner from '@/components/BackgroundRunner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'WebWatch Pro',
  description: 'Personal Website Monitor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased h-screen flex overflow-hidden bg-[#050810] text-slate-100`}>
        <BackgroundRunner />
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden relative z-0">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
