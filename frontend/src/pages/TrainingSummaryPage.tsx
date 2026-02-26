import React from 'react';
import { useGetAllEmployees, useGetTrainingRecordsByEmployee, useIsCallerAdmin } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ChevronRight } from 'lucide-react';
import { TrainingStatus } from '../backend';
import type { Employee } from '../backend';

type Page = "dashboard" | "employees" | "employee-profile" | "scheduling" | "portal" | "stock-requests" | "inventory" | "eom" | "appraisals" | "training-summary" | "holiday-stats" | "payroll-export" | "approval-queue" | "documents" | "resources";

interface TrainingSummaryPageProps {
  navigate: (page: Page, employeeId?: string) => void;
}

const EXPERIENCES = [
  "Milton General", "The Happy Institute", "The Dollhouse", "Wizard Of Oz",
  "St Georges General", "Break The Bank", "Marvellous Magic School", "Riddled",
  "Hell House", "The Don's Revenge", "Whodunit", "Battle Masters", "FEC General",
  "Time Raiders", "Laser Quest", "Retro Arcade", "7 Sins", "CSI Disco", "CSI Mafia",
  "Karaoke Lounge", "Karaoke Disco", "Like TV Game Show", "Splatter Room",
];

function EmployeeTrainingRow({ employee, navigate }: { employee: Employee; navigate: (page: Page, id?: string) => void }) {
  const { data: training } = useGetTrainingRecordsByEmployee(employee.id);
  const completed = training?.filter((t) => t.status === TrainingStatus.completed) || [];
  const experiences = completed.map((t) => {
    const parts = t.title.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : null;
  }).filter(Boolean) as string[];

  return (
    <div
      className="flex items-start justify-between p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary transition-colors"
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
      <div className="flex items-center gap-2 flex-wrap justify-end max-w-xs">
        {experiences.length === 0 ? (
          <span className="text-xs text-muted-foreground">No experience training</span>
        ) : (
          experiences.slice(0, 4).map((exp) => (
            <Badge key={exp} className="text-xs bg-primary/20 text-primary">{exp}</Badge>
          ))
        )}
        {experiences.length > 4 && (
          <Badge className="text-xs bg-secondary text-muted-foreground">+{experiences.length - 4} more</Badge>
        )}
        <ChevronRight size={16} className="text-muted-foreground ml-1" />
      </div>
    </div>
  );
}

export default function TrainingSummaryPage({ navigate }: TrainingSummaryPageProps) {
  const { data: employees, isLoading } = useGetAllEmployees();
  const { data: isAdmin } = useIsCallerAdmin();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  const activeEmployees = employees?.filter((e) => e.isActive) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Training Summary</h2>
        <p className="text-muted-foreground">Overview of which staff can run each experience</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {activeEmployees.map((emp) => (
            <EmployeeTrainingRow key={emp.id} employee={emp} navigate={navigate} />
          ))}
          {activeEmployees.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p>No employees found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
