import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { UserRole } from '../../backend';

type Page =
  | 'dashboard'
  | 'employees'
  | 'employee-profile'
  | 'scheduling'
  | 'portal'
  | 'stock-requests'
  | 'inventory'
  | 'eom'
  | 'appraisals'
  | 'training-summary'
  | 'holiday-stats'
  | 'payroll-export'
  | 'approval-queue'
  | 'documents'
  | 'resources';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  navigate: (page: Page, employeeId?: string) => void;
  isAdmin: boolean;
  userRole?: UserRole;
  userName?: string;
}

export default function MainLayout({
  children,
  currentPage,
  navigate,
  isAdmin,
  userRole,
  userName,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'oklch(0.97 0.002 0)' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => navigate(page as Page)}
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
