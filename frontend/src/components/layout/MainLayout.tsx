import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { UserRole } from "../../backend";

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

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  navigate: (page: Page, employeeId?: string) => void;
  isAdmin: boolean;
  userRole?: UserRole;
}

export default function MainLayout({ children, currentPage, navigate, isAdmin, userRole }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPage={currentPage}
        navigate={navigate}
        isAdmin={isAdmin}
        userRole={userRole}
      />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <Header
          navigate={navigate}
          isAdmin={isAdmin}
          userRole={userRole}
        />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
