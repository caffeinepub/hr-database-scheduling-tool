import React from 'react';
import { useGetAllEmployees, useGetAppraisalsByEmployee, useIsCallerAdmin } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, AlertCircle, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { nanosecondsToDate, addMonths, formatDate } from '../lib/utils';
import type { Employee } from '../backend';

type Page = "dashboard" | "employees" | "employee-profile" | "scheduling" | "portal" | "stock-requests" | "inventory" | "eom" | "appraisals" | "training-summary" | "holiday-stats" | "payroll-export" | "approval-queue" | "documents" | "resources";

interface AppraisalsDashboardPageProps {
  navigate: (page: Page, employeeId?: string) => void;
}

function EmployeeAppraisalRow({ employee, navigate }: { employee: Employee; navigate: (page: Page, id?: string) => void }) {
  const { data: appraisals } = useGetAppraisalsByEmployee(employee.id);

  const completed = appraisals?.filter((a) => a.isComplete) || [];
  const lastAppraisal = completed.sort((a, b) => Number(b.scheduledDate - a.scheduledDate))[0];
  const nextDue = lastAppraisal ? addMonths(nanosecondsToDate(lastAppraisal.scheduledDate), 3) : null;
  const isOverdue = nextDue && nextDue < new Date();
  const isUpcoming = nextDue && !isOverdue && (nextDue.getTime() - Date.now()) < 14 * 24 * 60 * 60 * 1000;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:border-primary transition-colors ${isOverdue ? 'border-destructive/50 bg-destructive/5' : isUpcoming ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border bg-card'}`}
      onClick={() => navigate('employee-profile', employee.id)}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
          {employee.fullName.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-foreground">{employee.fullName}</p>
          <p className="text-xs text-muted-foreground">{employee.jobTitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          {lastAppraisal ? (
            <p className="text-xs text-muted-foreground">Last: {formatDate(lastAppraisal.scheduledDate)}</p>
          ) : (
            <p className="text-xs text-muted-foreground">No appraisals yet</p>
          )}
          {nextDue && (
            <p className={`text-xs font-medium ${isOverdue ? 'text-destructive' : isUpcoming ? 'text-yellow-400' : 'text-muted-foreground'}`}>
              Next due: {nextDue.toLocaleDateString('en-GB')}
            </p>
          )}
        </div>
        {isOverdue && <Badge className="bg-destructive/20 text-destructive text-xs">Overdue</Badge>}
        {isUpcoming && !isOverdue && <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Due Soon</Badge>}
        {!isOverdue && !isUpcoming && lastAppraisal && <Badge className="bg-green-500/20 text-green-400 text-xs">Up to Date</Badge>}
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}

export default function AppraisalsDashboardPage({ navigate }: AppraisalsDashboardPageProps) {
  const { data: employees, isLoading } = useGetAllEmployees();
  const { data: isAdmin } = useIsCallerAdmin();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ClipboardList size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  const activeEmployees = employees?.filter((e) => e.isActive) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Appraisals Dashboard</h2>
        <p className="text-muted-foreground">Track appraisal status for all employees (next due: 3 months after last)</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {activeEmployees.map((emp) => (
            <EmployeeAppraisalRow key={emp.id} employee={emp} navigate={navigate} />
          ))}
          {activeEmployees.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p>No employees found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
