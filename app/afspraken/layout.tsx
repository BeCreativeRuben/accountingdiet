'use client';

import { SidebarProvider } from '@/lib/SidebarContext';
import Sidebar from '@/components/Sidebar';

export default function AfsprakenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
