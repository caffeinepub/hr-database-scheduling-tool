import React from "react";
import { useGetAllEmployees, useGetAllShifts, useGetAllHolidayRequests, useIsCallerAdmin, useGetCallerUserProfile } from "../hooks/useQueries";
import { Users, Calendar, Clock, Star, TrendingUp, AlertCircle } from "lucide-react";
import { formatDate, getWeekDates, nanosecondsToDate, isSameDay } from "../lib/utils";
import { HolidayRequestStatus } from "../backend";

type Page = "dashboard" | "employees" | "employee-profile" | "scheduling" | "portal" | "stock-requests" | "inventory" | "eom" | "appraisals" | "training-summary" | "holiday-stats" | "payroll-export" | "approval-queue" | "documents" | "resources";

interface DashboardPageProps {
  navigate: (page: Page) => void;
}

export default function DashboardPage({ navigate }: DashboardPageProps) {
  const { data: employees } = useGetAllEmployees();
  const { data: shifts } = useGetAllShifts();
  const { data: holidayRequests } = useGetAllHolidayRequests();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();

  const today = new Date();
  const weekDates = getWeekDates(today);

  const todayShifts = shifts?.filter((s) => {
    const shiftDate = nanosecondsToDate(s.date);
    return isSameDay(shiftDate, today);
  }) || [];

  const pendingHolidays = holidayRequests?.filter(
    (r) => r.status === HolidayRequestStatus.pending
  ) || [];

  const activeEmployees = employees?.filter((e) => e.isActive) || [];

  const stats = [
    {
      label: "Active Staff",
      value: activeEmployees.length,
      icon: <Users size={20} className="text-primary" />,
      onClick: () => navigate("employees"),
    },
    {
      label: "Shifts Today",
      value: todayShifts.length,
      icon: <Calendar size={20} className="text-primary" />,
      onClick: () => navigate("scheduling"),
    },
    {
      label: "Pending Holidays",
      value: pendingHolidays.length,
      icon: <Clock size={20} className="text-primary" />,
      onClick: () => navigate("holiday-stats"),
    },
    {
      label: "This Week's Shifts",
      value: shifts?.filter((s) => {
        const d = nanosecondsToDate(s.date);
        return d >= weekDates[0] && d <= weekDates[6];
      }).length || 0,
      icon: <TrendingUp size={20} className="text-primary" />,
      onClick: () => navigate("scheduling"),
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
                    onClick={() => navigate("holiday-stats")}
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
        · © {new Date().getFullYear()} Magnum HR
      </footer>
    </div>
  );
}
