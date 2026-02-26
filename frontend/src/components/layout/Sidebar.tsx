import React from 'react';
import {
  Users, Calendar, FileText, Shield, Trophy, BarChart3,
  Package, Home, BookOpen, DollarSign, ChevronRight, Lock, CheckSquare, ShoppingCart
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
      { id: 'todos', label: 'To Do', icon: <CheckSquare size={18} /> },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'employees', label: 'Staff', icon: <Users size={18} />, adminOnly: true },
      { id: 'scheduling', label: 'Scheduling', icon: <Calendar size={18} />, adminOnly: true },
      { id: 'holiday-stats', label: 'Holiday Stats', icon: <BarChart3 size={18} />, adminOnly: true },
      { id: 'portal', label: 'My Portal', icon: <Home size={18} /> },
    ],
  },
  {
    label: 'Recognition',
    items: [
      { id: 'eom', label: 'Employee of Month', icon: <Trophy size={18} /> },
    ],
  },
  {
    label: 'Resources',
    items: [
      { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
      { id: 'resources', label: 'Secure Resources', icon: <Lock size={18} /> },
      { id: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'stock-requests', label: 'Stock Requests', icon: <ShoppingCart size={18} /> },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'payroll-export', label: 'Payroll Export', icon: <DollarSign size={18} />, adminOnly: true },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'approval-queue', label: 'Admin Panel', icon: <Shield size={18} />, adminOnly: true },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate, isAdmin }: SidebarProps) {
  // Treat stock-requests-archive as part of stock-requests for active state
  const effectivePage = currentPage === 'stock-requests-archive' ? 'stock-requests' : currentPage;

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: 'oklch(0.1 0.005 0)' }}>
      {/* Brand Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'oklch(0.2 0.005 0)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center font-display text-lg font-bold"
            style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
          >
            E
          </div>
          <div>
            <div className="font-display text-xl tracking-widest" style={{ color: 'white' }}>
              ESC-HR
            </div>
            <div className="text-xs" style={{ color: 'oklch(0.55 0.005 0)' }}>
              The Panic Room
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(item => {
            if (item.adminOnly && !isAdmin) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-5">
              <div
                className="px-3 mb-1 text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'oklch(0.4 0.005 0)' }}
              >
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = effectivePage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onNavigate(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group"
                        style={{
                          backgroundColor: isActive ? 'oklch(0.48 0.22 27)' : 'transparent',
                          color: isActive ? 'white' : 'oklch(0.72 0.005 0)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'oklch(0.18 0.005 0)';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'oklch(0.72 0.005 0)';
                          }
                        }}
                      >
                        <span style={{ color: isActive ? 'white' : 'oklch(0.55 0.005 0)' }}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {isActive && (
                          <ChevronRight size={14} className="ml-auto" style={{ color: 'oklch(0.8 0.1 27)' }} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'oklch(0.2 0.005 0)' }}>
        <div className="text-xs text-center" style={{ color: 'oklch(0.35 0.005 0)' }}>
          ESC-HR by The Panic Room
        </div>
      </div>
    </aside>
  );
}
