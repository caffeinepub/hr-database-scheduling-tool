import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  User,
  Package,
  Warehouse,
  Star,
  ClipboardList,
  BookOpen,
  BarChart2,
  Download,
  CheckSquare,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { UserRole } from "../../backend";
import { cn } from "../../lib/utils";

type Page =
  | "dashboard"
  | "employees"
  | "employee-profile"
  | "scheduling"
  | "portal"
  | "stock-requests"
  | "inventory"
  | "eom"
  | "appraisals"
  | "training-summary"
  | "holiday-stats"
  | "payroll-export"
  | "approval-queue"
  | "documents"
  | "resources";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPage: Page;
  navigate: (page: Page) => void;
  isAdmin: boolean;
  userRole?: UserRole;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  managerOnly?: boolean;
  employeeOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function Sidebar({ collapsed, onToggle, currentPage, navigate, isAdmin, userRole }: SidebarProps) {
  const isManagerOrAbove = isAdmin || userRole === UserRole.user;

  const navGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { id: "portal", label: "My Portal", icon: <User size={18} /> },
      ],
    },
    {
      label: "Staff",
      items: [
        { id: "employees", label: "All Employees", icon: <Users size={18} />, managerOnly: true },
        { id: "approval-queue", label: "Approval Queue", icon: <CheckSquare size={18} />, adminOnly: true },
      ],
    },
    {
      label: "Scheduling",
      items: [
        { id: "scheduling", label: "Rota & Shifts", icon: <Calendar size={18} />, managerOnly: true },
        { id: "holiday-stats", label: "Holiday & Sickness", icon: <BarChart2 size={18} />, managerOnly: true },
        { id: "appraisals", label: "Appraisals", icon: <ClipboardList size={18} />, managerOnly: true },
        { id: "training-summary", label: "Training Summary", icon: <BookOpen size={18} />, managerOnly: true },
      ],
    },
    {
      label: "Stock Control",
      items: [
        { id: "stock-requests", label: "Stock Requests", icon: <Package size={18} /> },
        { id: "inventory", label: "Inventory", icon: <Warehouse size={18} />, managerOnly: true },
      ],
    },
    {
      label: "HR Tools",
      items: [
        { id: "payroll-export", label: "Payroll Export", icon: <Download size={18} />, managerOnly: true },
        { id: "eom", label: "Employee of Month", icon: <Star size={18} /> },
      ],
    },
    {
      label: "Resources",
      items: [
        { id: "documents", label: "Documents", icon: <FileText size={18} /> },
        { id: "resources", label: "Secure Resources", icon: <Lock size={18} /> },
      ],
    },
  ];

  const shouldShowItem = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.managerOnly && !isManagerOrAbove) return false;
    return true;
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border h-16">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/assets/generated/hr-hub-logo.dim_128x128.png" alt="Logo" className="w-8 h-8 rounded" />
            <span className="font-bold text-sidebar-foreground text-sm">Magnum HR</span>
          </div>
        )}
        {collapsed && (
          <img src="/assets/generated/hr-hub-logo.dim_128x128.png" alt="Logo" className="w-8 h-8 rounded mx-auto" />
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground transition-colors",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(shouldShowItem);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="border-t border-sidebar-border mx-2 mb-2" />}
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    currentPage === item.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Magnum HR
          </p>
        </div>
      )}
    </div>
  );
}
