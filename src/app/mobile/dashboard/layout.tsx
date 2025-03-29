// src/app/mobile/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MobileSidebar from '@components/mobile/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false); 

  return (
    <div className="min-h-screen bg-gradient relative">
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(24,24,27,0.5)] backdrop-blur-sm border border-zinc-700"
        >
          {showSidebar ? (
            <CloseIcon className="text-white" />
          ) : (
            <MenuIcon className="text-white" />
          )}
        </button>
      </div>

      <div 
        className={`fixed inset-y-0 right-0 w-[280px] bg-[rgba(24,24,27,0.95)] backdrop-blur-md border-l border-zinc-700 transform transition-transform duration-300 ease-in-out ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        } z-40`}
      >
        <MobileSidebar onClose={() => setShowSidebar(false)} />
      </div>

      <main className="p-4 pt-16">
        {children}
      </main>
    </div>
  );
}