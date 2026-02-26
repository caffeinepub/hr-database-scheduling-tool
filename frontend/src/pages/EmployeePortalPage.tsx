import React, { useState } from 'react';
import {
  useGetCallerUserProfile,
  useGetShiftsByEmployee,
  useGetHolidayRequestsByEmployee,
  useSubmitHolidayRequest,
  useUpdateHolidayRequestStatus,
  useIsCallerAdmin,
  useGetCallerUserRole,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plane, Plus, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { formatDate, formatTime, generateId, dateToNanoseconds } from '../lib/utils';
import { HolidayRequestStatus, UserRole } from '../backend';
import type { HolidayRequest } from '../backend';
import { toast } from 'sonner';

type Page = "dashboard" | "employees" | "employee-profile" | "scheduling" | "portal" | "stock-requests" | "inventory" | "eom" | "appraisals" | "training-summary" | "holiday-stats" | "payroll-export" | "approval-queue" | "documents" | "resources";

interface EmployeePortalPageProps {
  navigate: (page: Page) => void;
}

const STATUS_STYLES: Record<HolidayRequestStatus, string> = {
  [HolidayRequestStatus.pending]: 'bg-yellow-500/20 text-yellow-400',
  [HolidayRequestStatus.approved]: 'bg-green-500/20 text-green-400',
  [HolidayRequestStatus.declined]: 'bg-destructive/20 text-destructive',
};

const STATUS_LABELS: Record<HolidayRequestStatus, string> = {
  [HolidayRequestStatus.pending]: 'Pending',
  [HolidayRequestStatus.approved]: 'Approved',
  [HolidayRequestStatus.declined]: 'Declined',
};

export default function EmployeePortalPage({ navigate }: EmployeePortalPageProps) {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userRole } = useGetCallerUserRole();

  const employeeId = userProfile?.employeeId ?? '';

  const { data: shifts, isLoading: shiftsLoading } = useGetShiftsByEmployee(employeeId);
  const { data: holidayRequests, isLoading: holidayLoading } = useGetHolidayRequestsByEmployee(employeeId);

  const submitHolidayRequest = useSubmitHolidayRequest();
  const updateStatus = useUpdateHolidayRequestStatus();

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [requestType, setRequestType] = useState<'paid' | 'unpaid'>('paid');

  const isManagerOrAdmin = isAdmin || userRole === UserRole.user;

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error('Your account is not linked to an employee record. Please contact your administrator.');
      return;
    }

    const request: HolidayRequest = {
      id: generateId(),
      employeeId,
      startDate: dateToNanoseconds(new Date(startDate)),
      endDate: dateToNanoseconds(new Date(endDate)),
      reason: `[${requestType === 'paid' ? 'PAID' : 'UNPAID'}] ${reason.trim()}`.trim(),
      status: HolidayRequestStatus.pending,
      createdAt: dateToNanoseconds(new Date()),
    };

    try {
      await submitHolidayRequest.mutateAsync(request);
      toast.success('Holiday request submitted successfully!');
      setShowForm(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit holiday request');
    }
  };

  const handleUpdateStatus = async (id: string, status: HolidayRequestStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Request ${status === HolidayRequestStatus.approved ? 'approved' : 'declined'}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update status');
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const upcomingShifts = (shifts || [])
    .filter((s) => Number(s.date) / 1_000_000 >= Date.now())
    .sort((a, b) => Number(a.date) - Number(b.date))
    .slice(0, 10);

  const sortedRequests = (holidayRequests || []).sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {userProfile?.name || 'Employee'}
        </h2>
        <p className="text-muted-foreground">Your personal employee portal</p>
      </div>

      {!employeeId && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm">
          ⚠️ Your account is not yet linked to an employee record. Contact your administrator to link your account.
        </div>
      )}

      {/* Profile Summary */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{userProfile?.name || 'Employee'}</p>
            <p className="text-muted-foreground text-sm">
              {isAdmin ? 'Admin' : userRole === UserRole.user ? 'Manager/Supervisor' : 'Team Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Shifts */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">My Upcoming Shifts</h3>
        </div>
        {shiftsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : upcomingShifts.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No upcoming shifts scheduled.</p>
        ) : (
          <div className="space-y-2">
            {upcomingShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{formatDate(shift.date)}</p>
                    <p className="text-xs text-muted-foreground">{shift.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock size={12} />
                  <span>{formatTime(shift.startTime)} – {formatTime(shift.endTime)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Holiday Requests */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">Holiday Requests</h3>
          </div>
          {employeeId && (
            <Button size="sm" onClick={() => setShowForm(!showForm)} variant="outline" className="border-border text-foreground hover:bg-secondary">
              <Plus size={14} className="mr-1" />
              New Request
            </Button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmitRequest} className="border border-border rounded-xl p-4 space-y-3 bg-secondary mb-4">
            <h4 className="font-medium text-sm text-foreground">New Time Off Request</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground text-xs">Request Type</Label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as 'paid' | 'unpaid')}
                  className="w-full mt-1 bg-input border border-border text-foreground rounded-lg px-3 py-2 text-sm"
                >
                  <option value="paid">Paid Time Off</option>
                  <option value="unpaid">Unpaid Time Off</option>
                </select>
              </div>
              <div />
              <div>
                <Label className="text-foreground text-xs">Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-input border-border text-foreground mt-1" required />
              </div>
              <div>
                <Label className="text-foreground text-xs">End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="bg-input border-border text-foreground mt-1" required />
              </div>
            </div>
            <div>
              <Label className="text-foreground text-xs">Reason (optional)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional reason..." rows={2} className="bg-input border-border text-foreground mt-1" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={submitHolidayRequest.isPending}>
                {submitHolidayRequest.isPending ? <Loader2 size={12} className="mr-1 animate-spin" /> : null}
                Submit Request
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)} className="text-muted-foreground">
                Cancel
              </Button>
            </div>
          </form>
        )}

        {holidayLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : sortedRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No holiday requests yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  {req.reason && (
                    <p className="text-xs text-muted-foreground">{req.reason}</p>
                  )}
                </div>
                {isManagerOrAdmin && req.status === HolidayRequestStatus.pending && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={() => handleUpdateStatus(req.id, HolidayRequestStatus.approved)} disabled={updateStatus.isPending}>
                      <CheckCircle size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(req.id, HolidayRequestStatus.declined)} disabled={updateStatus.isPending}>
                      <XCircle size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
