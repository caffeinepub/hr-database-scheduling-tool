import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface HeaderProps {
  userName?: string;
  isAdmin?: boolean;
  currentPage?: string;
}

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Staff Management',
  scheduling: 'Scheduling',
  'employee-portal': 'My Portal',
  'employee-of-month': 'Employee of the Month',
  documents: 'Company Documents',
  'secure-resources': 'Secure Resources',
  inventory: 'Inventory',
  payroll: 'Payroll Export',
  admin: 'Admin Panel',
  'holiday-statistics': 'Holiday Statistics',
};

export default function Header({ userName, isAdmin, currentPage }: HeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const pageTitle = currentPage ? pageTitles[currentPage] || 'ESC-HR' : 'ESC-HR';

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{
        backgroundColor: 'oklch(0.12 0.005 0)',
        borderColor: 'oklch(0.22 0.005 0)',
      }}
    >
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div
          className="h-6 w-1 rounded-full"
          style={{ backgroundColor: 'oklch(0.48 0.22 27)' }}
        />
        <h1
          className="font-display text-2xl tracking-wider"
          style={{ color: 'white' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell placeholder */}
        <button
          className="w-9 h-9 rounded-md flex items-center justify-center transition-colors"
          style={{ color: 'oklch(0.55 0.005 0)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'oklch(0.2 0.005 0)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'oklch(0.55 0.005 0)';
          }}
        >
          <Bell size={18} />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ backgroundColor: 'oklch(0.18 0.005 0)' }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
          >
            {userName ? userName.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none" style={{ color: 'white' }}>
              {userName || 'User'}
            </span>
            {isAdmin && (
              <span className="text-xs leading-none mt-0.5" style={{ color: 'oklch(0.55 0.22 27)' }}>
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Logout */}
        {identity && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-sm"
            style={{ color: 'oklch(0.55 0.005 0)' }}
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}
      </div>
    </header>
  );
}
