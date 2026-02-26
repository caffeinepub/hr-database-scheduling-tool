import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { useGetCallerUserProfile, useIsCallerAdmin, useGetCallerUserRole } from './hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole } from './backend';
import { ADMIN_LOGIN_PENDING_KEY } from './pages/LoginPage';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProfileSetupModal from './components/auth/ProfileSetupModal';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import SchedulingPage from './pages/SchedulingPage';
import EmployeePortalPage from './pages/EmployeePortalPage';
import StockRequestsPage from './pages/StockRequestsPage';
import StockRequestArchivePage from './pages/StockRequestArchivePage';
import InventoryManagementPage from './pages/InventoryManagementPage';
import EmployeeOfMonthPage from './pages/EmployeeOfMonthPage';
import AppraisalsDashboardPage from './pages/AppraisalsDashboardPage';
import TrainingSummaryPage from './pages/TrainingSummaryPage';
import HolidayStatisticsPage from './pages/HolidayStatisticsPage';
import PayrollExportPage from './pages/PayrollExportPage';
import AdminApprovalQueuePage from './pages/AdminApprovalQueuePage';
import DocumentsPage from './pages/DocumentsPage';
import ResourcesPage from './pages/ResourcesPage';
import ToDoPage from './pages/ToDoPage';

export type Page =
  | 'dashboard'
  | 'employees'
  | 'employee-profile'
  | 'scheduling'
  | 'portal'
  | 'stock-requests'
  | 'stock-requests-archive'
  | 'inventory'
  | 'eom'
  | 'appraisals'
  | 'training-summary'
  | 'holiday-stats'
  | 'payroll-export'
  | 'approval-queue'
  | 'documents'
  | 'resources'
  | 'todos';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const { actor, isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [adminBootstrapDone, setAdminBootstrapDone] = useState(false);
  const [adminBootstrapping, setAdminBootstrapping] = useState(false);
  const bootstrapCalledRef = useRef(false);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin, isFetched: isAdminFetched } = useIsCallerAdmin();
  const { data: userRole, isFetched: userRoleFetched } = useGetCallerUserRole();

  // After login, if admin credentials were used, call markAdminLoggedInSuccessfully
  useEffect(() => {
    const adminPending = sessionStorage.getItem(ADMIN_LOGIN_PENDING_KEY);
    if (
      isAuthenticated &&
      actor &&
      !actorFetching &&
      adminPending === 'true' &&
      !bootstrapCalledRef.current
    ) {
      bootstrapCalledRef.current = true;
      setAdminBootstrapping(true);
      sessionStorage.removeItem(ADMIN_LOGIN_PENDING_KEY);

      actor
        .markAdminLoggedInSuccessfully()
        .then(() => {
          qc.invalidateQueries({ queryKey: ['isCallerAdmin'] });
          qc.invalidateQueries({ queryKey: ['isCallerApproved'] });
          qc.invalidateQueries({ queryKey: ['callerUserRole'] });
          qc.invalidateQueries({ queryKey: ['currentUserProfile'] });
        })
        .catch(() => {
          // Even if it fails (already bootstrapped), proceed normally
        })
        .finally(() => {
          setAdminBootstrapDone(true);
          setAdminBootstrapping(false);
        });
    } else if (!adminPending || adminPending !== 'true') {
      if (!adminBootstrapDone && !bootstrapCalledRef.current) {
        setAdminBootstrapDone(true);
      }
    }
  }, [isAuthenticated, actor, actorFetching, qc]);

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const navigate = (page: Page, employeeId?: string) => {
    setCurrentPage(page);
    if (employeeId !== undefined) setSelectedEmployeeId(employeeId);
  };

  // Wrapper for pages that only accept (page: string) => void
  const navigateString = (page: string) => navigate(page as Page);

  if (!isAuthenticated && !isLoggingIn) {
    return (
      <>
        <LoginPage />
        <Toaster richColors />
      </>
    );
  }

  if (isLoggingIn || profileLoading || adminBootstrapping) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'oklch(0.1 0.005 0)' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center font-display text-3xl font-bold mx-auto mb-4"
            style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
          >
            E
          </div>
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: 'oklch(0.48 0.22 27)', borderTopColor: 'transparent' }}
          />
          <p className="mt-3 text-sm" style={{ color: 'oklch(0.55 0.005 0)' }}>
            {adminBootstrapping ? 'Setting up admin account...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const authQueriesResolved = isAdminFetched && userRoleFetched;
  if (isAuthenticated && profileFetched && !authQueriesResolved) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'oklch(0.1 0.005 0)' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: 'oklch(0.48 0.22 27)', borderTopColor: 'transparent' }}
          />
          <p className="mt-3 text-sm" style={{ color: 'oklch(0.55 0.005 0)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage isAdmin={!!isAdmin} onNavigate={navigate} />;
      case 'employees':
        return <EmployeesPage navigate={navigate} />;
      case 'employee-profile':
        return (
          <EmployeeProfilePage
            employeeId={selectedEmployeeId}
            navigate={navigate}
            isAdmin={!!isAdmin}
            currentUserEmployeeId={userProfile?.employeeId ?? undefined}
          />
        );
      case 'scheduling':
        return <SchedulingPage navigate={navigate} />;
      case 'portal':
        return <EmployeePortalPage navigate={navigate} />;
      case 'stock-requests':
        return <StockRequestsPage onNavigate={navigateString} />;
      case 'stock-requests-archive':
        return <StockRequestArchivePage onNavigate={navigateString} />;
      case 'inventory':
        return <InventoryManagementPage />;
      case 'eom':
        return <EmployeeOfMonthPage />;
      case 'appraisals':
        return <AppraisalsDashboardPage navigate={navigate} />;
      case 'training-summary':
        return <TrainingSummaryPage navigate={navigate} />;
      case 'holiday-stats':
        return <HolidayStatisticsPage />;
      case 'payroll-export':
        return <PayrollExportPage />;
      case 'approval-queue':
        return <AdminApprovalQueuePage />;
      case 'documents':
        return <DocumentsPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'todos':
        return <ToDoPage isAdmin={!!isAdmin} />;
      default:
        return <DashboardPage isAdmin={!!isAdmin} onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'oklch(0.97 0.002 0)' }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => navigate(page as Page)}
        isAdmin={!!isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={userProfile?.name}
          isAdmin={!!isAdmin}
          currentPage={currentPage}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
        <footer
          className="px-6 py-3 border-t text-center text-xs"
          style={{ borderColor: 'oklch(0.88 0.003 0)', color: 'oklch(0.55 0.005 0)' }}
        >
          © {new Date().getFullYear()} ESC-HR · Built with{' '}
          <span style={{ color: 'oklch(0.48 0.22 27)' }}>♥</span>{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'esc-hr')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            style={{ color: 'oklch(0.48 0.22 27)' }}
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      {showProfileSetup && <ProfileSetupModal />}
      <Toaster richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
