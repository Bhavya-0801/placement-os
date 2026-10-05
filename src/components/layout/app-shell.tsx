'use client';

import React, { useState } from 'react';
import { Sidebar, TopBar, MobileNav } from './navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080818] mesh-gradient bg-grid">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="px-4 md:px-6 py-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
