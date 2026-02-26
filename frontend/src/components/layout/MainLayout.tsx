import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin: boolean;
  userName?: string;
  pageTitle?: string;
  onLogout?: () => void;
}

export default function MainLayout({
  children,
  currentPage,
  onNavigate,
  isAdmin,
  userName,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'oklch(0.97 0.002 0)' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isAdmin={isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={userName}
          isAdmin={isAdmin}
          currentPage={currentPage}
        />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
