import { ReactNode } from 'react';
import { SoftSidebar } from './SoftSidebar';

interface SoftLayoutProps {
  children: ReactNode;
}

export function SoftLayout({ children }: SoftLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <SoftSidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-0 ml-0 pt-16 md:pt-0">{children}</main>
    </div>
  );
}
