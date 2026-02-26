import React from "react";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Check,
  RefreshCw,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useGetAllEmployees,
  useGetAllShifts,
  useGetAllHolidayRequests,
  useIsCallerAdmin,
  useGetCallerUserProfile,
  useGetTasksForToday,
  useMarkTaskComplete,
} from "../hooks/useQueries";
import { formatDate, getWeekDates, nanosecondsToDate, isSameDay } from "../lib/utils";
import { HolidayRequestStatus, DayOfWeek, Employee, ToDoTask } from "../backend";

export type Page =
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
  | 'resources'
  | 'todos';

interface DashboardPageProps {
  isAdmin: boolean;
  onNavigate: (page: Page) => void;
}

function getTodayDayOfWeek(): DayOfWeek {
  const day = new Date().getDay();
  const map: Record<number, DayOfWeek> = {
    0: DayOfWeek.sunday,
    1: DayOfWeek.monday,
    2: DayOfWeek.tuesday,
    3: DayOfWeek.wednesday,
    4: DayOfWeek.thursday,
    5: DayOfWeek.friday,
    6: DayOfWeek.saturday,
  };
  return map[day];
}

function formatCompletionTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TodayTaskItemProps {
  task: ToDoTask;
  employees: Employee[];
  onMarkComplete: (id: string) => void;
  isCompleting: boolean;
  completingId: string | null;
}

function TodayTaskItem({
  task,
  employees,
  onMarkComplete,
  isCompleting,
  completingId,
}: TodayTaskItemProps) {
  const isThisCompleting = isCompleting && completingId === task.id;
  const isCompleted = !!task.completedBy;

  const assigneeLabel =
    task.assignee.__kind__ === "everyone"
      ? "Everyone"
      : (() => {
          const emp = employees.find(
            (e) =>
              e.id ===
              (task.assignee as { __kind__: "employee"; employee: string }).employee
          );
          return emp ? emp.fullName : "Unknown";
        })();

  return (
    <div
      className={`flex items-center justify-between gap-3 py-3 px-4 rounded-lg border transition-all ${
        isCompleted
          ? "bg-green-50 border-green-200 opacity-80"
          : "bg-white border-gray-100 hover:border-primary/20"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {Number(task.durationMins)} mins
          </span>
          <span className="flex items-center gap-1">
            <User size={10} />
            {assigneeLabel}
          </span>
          {isCompleted && task.completedTimestamp && (
            <span className="flex items-center gap-1 text-green-600">
              <Check size={10} />
              Done at {formatCompletionTime(task.completedTimestamp)}
            </span>
          )}
        </div>
      </div>

      {!isCompleted && (
        <Button
          size="sm"
          onClick={() => onMarkComplete(task.id)}
          disabled={isThisCompleting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-7 px-2 flex-shrink-0"
        >
          {isThisCompleting ? (
            <RefreshCw size={11} className="animate-spin" />
          ) : (
            <span className="flex items-center gap-1">
              <Check size={11} /> Done
            </span>
          )}
        </Button>
      )}
      {isCompleted && (
        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex-shrink-0">
          <Check size={10} className="mr-1" /> Complete
        </Badge>
      )}
    </div>
  );
}

export default function DashboardPage({ isAdmin, onNavigate }: DashboardPageProps) {
  const { data: employees = [] } = useGetAllEmployees();
  const { data: shifts } = useGetAllShifts();
  const { data: holidayRequests } = useGetAllHolidayRequests();
  const { data: userProfile } = useGetCallerUserProfile();

  const todayDow = getTodayDayOfWeek();
  const { data: todayTasks = [], isLoading: tasksLoading } = useGetTasksForToday(todayDow);
  const markComplete = useMarkTaskComplete();
  const [completingId, setCompletingId] = React.useState<string | null>(null);

  const handleMarkComplete = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      await markComplete.mutateAsync(taskId);
    } finally {
      setCompletingId(null);
    }
  };

  const today = new Date();
  const weekDates = getWeekDates(today);

  const todayShifts = shifts?.filter((s) => {
    const shiftDate = nanosecondsToDate(s.date);
    return isSameDay(shiftDate, today);
  }) || [];

  const pendingHolidays = holidayRequests?.filter(
    (r) => r.status === HolidayRequestStatus.pending
  ) || [];

  const activeEmployees = employees.filter((e) => e.isActive);

  const pendingTodayTasks = todayTasks.filter((t) => !t.completedBy);
  const completedTodayTasks = todayTasks.filter((t) => !!t.completedBy);

  const stats = [
    {
      label: "Active Staff",
      value: activeEmployees.length,
      icon: <Users size={20} className="text-primary" />,
      onClick: () => onNavigate("employees"),
    },
    {
      label: "Shifts Today",
      value: todayShifts.length,
      icon: <Calendar size={20} className="text-primary" />,
      onClick: () => onNavigate("scheduling"),
    },
    {
      label: "Pending Holidays",
      value: pendingHolidays.length,
      icon: <Clock size={20} className="text-primary" />,
      onClick: () => onNavigate("holiday-stats"),
    },
    {
      label: "This Week's Shifts",
      value: shifts?.filter((s) => {
        const d = nanosecondsToDate(s.date);
        return d >= weekDates[0] && d <= weekDates[6];
      }).length || 0,
      icon: <TrendingUp size={20} className="text-primary" />,
      onClick: () => onNavigate("scheduling"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {userProfile?.name || "User"}
        </h2>
        <p className="text-muted-foreground">
          {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Today's To Do */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckSquare size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Today's To Do</h3>
              <p className="text-xs text-muted-foreground">
                {pendingTodayTasks.length} pending · {completedTodayTasks.length} done
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("todos")}
            className="text-primary hover:text-primary text-xs"
          >
            View All →
          </Button>
        </div>
        <div className="p-4">
          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckSquare size={28} className="text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No tasks scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <TodayTaskItem
                  key={task.id}
                  task={task}
                  employees={employees}
                  onMarkComplete={handleMarkComplete}
                  isCompleting={markComplete.isPending}
                  completingId={completingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Holiday Requests */}
        {isAdmin && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-primary" />
              Pending Holiday Requests
            </h3>
            {pendingHolidays.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending requests</p>
            ) : (
              <div className="space-y-2">
                {pendingHolidays.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                    <div>
                      <p className="text-sm text-foreground">Employee: {req.employeeId.substring(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(req.startDate)} – {formatDate(req.endDate)}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Pending</span>
                  </div>
                ))}
                {pendingHolidays.length > 5 && (
                  <button
                    onClick={() => onNavigate("holiday-stats")}
                    className="text-sm text-primary hover:underline"
                  >
                    View all {pendingHolidays.length} requests →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Today's Shifts */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Today's Shifts
          </h3>
          {todayShifts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No shifts scheduled today</p>
          ) : (
            <div className="space-y-2">
              {todayShifts.slice(0, 5).map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-foreground">{shift.department}</p>
                    <p className="text-xs text-muted-foreground">
                      {shift.assignedEmployees.length} employee(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
        Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>{" "}
        · © {new Date().getFullYear()} ESC-HR
      </footer>
    </div>
  );
}
