import React from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetCallerUserProfile, useGetCallerUserRole } from "../../hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "../../backend";

type Page = "dashboard" | "employees" | "employee-profile" | "scheduling" | "portal" | "stock-requests" | "inventory" | "eom" | "appraisals" | "training-summary" | "holiday-stats" | "payroll-export" | "approval-queue" | "documents" | "resources";

interface HeaderProps {
  navigate: (page: Page) => void;
  isAdmin: boolean;
  userRole?: UserRole;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "All Employees",
  "employee-profile": "Employee Profile",
  scheduling: "Rota & Scheduling",
  portal: "My Portal",
  "stock-requests": "Stock Requests",
  inventory: "Inventory Management",
  eom: "Employee of the Month",
  appraisals: "Appraisals Dashboard",
  "training-summary": "Training Summary",
  "holiday-stats": "Holiday & Sickness Statistics",
  "payroll-export": "Payroll Export",
  "approval-queue": "Approval Queue",
  documents: "Documents",
  resources: "Secure Resources",
};

export default function Header({ navigate, isAdmin, userRole }: HeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: role } = useGetCallerUserRole();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const getRoleLabel = () => {
    if (isAdmin) return "Admin";
    if (role === UserRole.user) return "Manager";
    return "Employee";
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Magnum HR Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User size={14} className="text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-foreground text-sm">
              {userProfile?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <LogOut size={16} className="mr-1" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
