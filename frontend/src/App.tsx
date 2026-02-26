import React, { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
  useIsCallerAdmin,
  useIsCallerApproved,
  useGetCallerUserRole,
} from "./hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { UserRole } from "./backend";

// Pages
import LoginPage from "./pages/LoginPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";
import SchedulingPage from "./pages/SchedulingPage";
import EmployeePortalPage from "./pages/EmployeePortalPage";
import StockRequestsPage from "./pages/StockRequestsPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import EmployeeOfMonthPage from "./pages/EmployeeOfMonthPage";
import AppraisalsDashboardPage from "./pages/AppraisalsDashboardPage";
import TrainingSummaryPage from "./pages/TrainingSummaryPage";
import HolidayStatisticsPage from "./pages/HolidayStatisticsPage";
import PayrollExportPage from "./pages/PayrollExportPage";
import AdminApprovalQueuePage from "./pages/AdminApprovalQueuePage";
import DocumentsPage from "./pages/DocumentsPage";
import ResourcesPage from "./pages/ResourcesPage";
import ProfileSetupModal from "./components/auth/ProfileSetupModal";
import MainLayout from "./components/layout/MainLayout";

export type Page =
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

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: isApproved } = useIsCallerApproved();
  const { data: userRole } = useGetCallerUserRole();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const navigate = (page: Page, employeeId?: string) => {
    setCurrentPage(page);
    if (employeeId !== undefined) setSelectedEmployeeId(employeeId);
  };

  if (!isAuthenticated && !isLoggingIn) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (isLoggingIn || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && profileFetched && !isAdmin && isApproved === false) {
    return (
      <>
        <PendingApprovalPage />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage navigate={navigate} />;
      case "employees":
        return <EmployeesPage navigate={navigate} />;
      case "employee-profile":
        return (
          <EmployeeProfilePage
            employeeId={selectedEmployeeId}
            navigate={navigate}
          />
        );
      case "scheduling":
        return <SchedulingPage navigate={navigate} />;
      case "portal":
        return <EmployeePortalPage navigate={navigate} />;
      case "stock-requests":
        return <StockRequestsPage />;
      case "inventory":
        return <InventoryManagementPage />;
      case "eom":
        return <EmployeeOfMonthPage />;
      case "appraisals":
        return <AppraisalsDashboardPage navigate={navigate} />;
      case "training-summary":
        return <TrainingSummaryPage navigate={navigate} />;
      case "holiday-stats":
        return <HolidayStatisticsPage />;
      case "payroll-export":
        return <PayrollExportPage />;
      case "approval-queue":
        return <AdminApprovalQueuePage />;
      case "documents":
        return <DocumentsPage />;
      case "resources":
        return <ResourcesPage />;
      default:
        return <DashboardPage navigate={navigate} />;
    }
  };

  return (
    <>
      <MainLayout
        currentPage={currentPage}
        navigate={navigate}
        isAdmin={!!isAdmin}
        userRole={userRole}
      >
        {renderPage()}
      </MainLayout>
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}
