import React, { useState } from 'react';
import { useGetAllShifts, useGetAllEmployees, useGetAllHolidayRequests, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileText } from 'lucide-react';
import { nanosecondsToDate, getWeekDates } from '../lib/utils';
import { HolidayRequestStatus } from '../backend';
import { toast } from 'sonner';

type ExportPeriod = 'current-week' | 'two-week' | 'custom';

function getShiftType(department: string): string {
  if (department.startsWith('[PAID-LEAVE]')) return 'Paid Leave';
  if (department.startsWith('[UNPAID-LEAVE]')) return 'Unpaid Leave';
  if (department.startsWith('[SICKNESS]')) return 'Sickness';
  return 'Worked';
}

function calcHours(startNs: bigint, endNs: bigint): number {
  const diff = Number(endNs - startNs) / 1_000_000 / 1000 / 3600;
  return Math.round(diff * 100) / 100;
}

export default function PayrollExportPage() {
  const { data: shifts } = useGetAllShifts();
  const { data: employees } = useGetAllEmployees();
  const { data: holidayRequests } = useGetAllHolidayRequests();
  const { data: isAdmin } = useIsCallerAdmin();

  const [period, setPeriod] = useState<ExportPeriod>('current-week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Download size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  const getDateRange = (): { start: Date; end: Date } => {
    const today = new Date();
    if (period === 'current-week') {
      const week = getWeekDates(today);
      return { start: week[0], end: week[6] };
    }
    if (period === 'two-week') {
      const week = getWeekDates(today);
      const twoWeekStart = new Date(week[0]);
      twoWeekStart.setDate(twoWeekStart.getDate() - 7);
      return { start: twoWeekStart, end: week[6] };
    }
    return {
      start: customStart ? new Date(customStart) : new Date(),
      end: customEnd ? new Date(customEnd) : new Date(),
    };
  };

  const handleExport = () => {
    if (period === 'custom' && (!customStart || !customEnd)) {
      toast.error('Please select a custom date range');
      return;
    }

    const { start, end } = getDateRange();
    end.setHours(23, 59, 59, 999);

    // Build per-employee data
    const empMap: Record<string, {
      name: string;
      workedHours: number;
      paidLeaveHours: number;
      unpaidLeaveHours: number;
      sicknessHours: number;
      holidayDays: number;
    }> = {};

    (employees || []).forEach((emp) => {
      empMap[emp.id] = {
        name: emp.fullName,
        workedHours: 0,
        paidLeaveHours: 0,
        unpaidLeaveHours: 0,
        sicknessHours: 0,
        holidayDays: 0,
      };
    });

    // Process shifts
    (shifts || []).forEach((shift) => {
      const shiftDate = nanosecondsToDate(shift.date);
      if (shiftDate < start || shiftDate > end) return;
      const hours = calcHours(shift.startTime, shift.endTime);
      const type = getShiftType(shift.department);
      shift.assignedEmployees.forEach((empId) => {
        if (!empMap[empId]) return;
        if (type === 'Worked') empMap[empId].workedHours += hours;
        else if (type === 'Paid Leave') empMap[empId].paidLeaveHours += hours;
        else if (type === 'Unpaid Leave') empMap[empId].unpaidLeaveHours += hours;
        else if (type === 'Sickness') empMap[empId].sicknessHours += hours;
      });
    });

    // Process holiday requests
    (holidayRequests || []).filter((r) => r.status === HolidayRequestStatus.approved).forEach((req) => {
      const reqStart = nanosecondsToDate(req.startDate);
      const reqEnd = nanosecondsToDate(req.endDate);
      if (reqEnd < start || reqStart > end) return;
      const days = Math.ceil((Math.min(reqEnd.getTime(), end.getTime()) - Math.max(reqStart.getTime(), start.getTime())) / (1000 * 60 * 60 * 24)) + 1;
      if (empMap[req.employeeId]) {
        empMap[req.employeeId].holidayDays += days;
      }
    });

    // Build CSV
    const headers = ['Employee Name', 'Worked Hours', 'Paid Leave Hours', 'Unpaid Leave Hours', 'Sickness Hours', 'Holiday Days'];
    const rows = Object.values(empMap).map((e) => [
      e.name,
      e.workedHours.toFixed(2),
      e.paidLeaveHours.toFixed(2),
      e.unpaidLeaveHours.toFixed(2),
      e.sicknessHours.toFixed(2),
      e.holidayDays.toString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${start.toISOString().split('T')[0]}-to-${end.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Payroll CSV exported successfully');
  };

  const { start, end } = getDateRange();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payroll Export</h2>
        <p className="text-muted-foreground">Export shift and leave data as CSV for payroll processing</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div>
          <Label className="text-foreground font-semibold">Export Period</Label>
          <div className="grid grid-cols-1 gap-3 mt-3">
            {[
              { value: 'current-week', label: 'Current Week (Thu – Wed)', desc: 'This week\'s data' },
              { value: 'two-week', label: '2-Week Period (Thu – Wed)', desc: 'Last 2 weeks of data' },
              { value: 'custom', label: 'Custom Date Range', desc: 'Select your own dates' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${period === opt.value ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-primary/50'}`}
              >
                <input
                  type="radio"
                  name="period"
                  value={opt.value}
                  checked={period === opt.value}
                  onChange={() => setPeriod(opt.value as ExportPeriod)}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground text-sm">Start Date</Label>
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-input border-border text-foreground mt-1" />
            </div>
            <div>
              <Label className="text-foreground text-sm">End Date</Label>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} min={customStart} className="bg-input border-border text-foreground mt-1" />
            </div>
          </div>
        )}

        {period !== 'custom' && (
          <div className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">
            <p>Export range: <span className="text-foreground font-medium">{start.toLocaleDateString('en-GB')} – {end.toLocaleDateString('en-GB')}</span></p>
          </div>
        )}

        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            CSV will include:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Employee Name</li>
            <li>Worked Hours</li>
            <li>Paid Leave Hours</li>
            <li>Unpaid Leave Hours</li>
            <li>Sickness Hours</li>
            <li>Holiday Days (approved requests)</li>
          </ul>
        </div>

        <Button onClick={handleExport} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download size={16} className="mr-2" />
          Export Payroll CSV
        </Button>
      </div>
    </div>
  );
}
