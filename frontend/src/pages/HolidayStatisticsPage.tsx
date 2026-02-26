import React from 'react';
import { useGetAllHolidayRequests, useGetAllEmployees, useUpdateHolidayRequestStatus, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate, daysBetween } from '../lib/utils';
import { HolidayRequestStatus } from '../backend';
import { toast } from 'sonner';

export default function HolidayStatisticsPage() {
  const { data: requests, isLoading } = useGetAllHolidayRequests();
  const { data: employees } = useGetAllEmployees();
  const { data: isAdmin } = useIsCallerAdmin();
  const updateStatus = useUpdateHolidayRequestStatus();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart2 size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  const getEmployeeName = (id: string) => employees?.find((e) => e.id === id)?.fullName || id;

  const pending = requests?.filter((r) => r.status === HolidayRequestStatus.pending) || [];
  const approved = requests?.filter((r) => r.status === HolidayRequestStatus.approved) || [];
  const declined = requests?.filter((r) => r.status === HolidayRequestStatus.declined) || [];

  const totalApprovedDays = approved.reduce((sum, r) => sum + daysBetween(r.startDate, r.endDate) + 1, 0);

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: HolidayRequestStatus.approved });
      toast.success('Request approved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: HolidayRequestStatus.declined });
      toast.success('Request declined');
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline');
    }
  };

  const STATUS_STYLES: Record<HolidayRequestStatus, string> = {
    [HolidayRequestStatus.pending]: 'bg-yellow-500/20 text-yellow-400',
    [HolidayRequestStatus.approved]: 'bg-green-500/20 text-green-400',
    [HolidayRequestStatus.declined]: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Holiday & Sickness Statistics</h2>
        <p className="text-muted-foreground">Manage and review all time-off requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pending.length, color: 'text-yellow-400' },
          { label: 'Approved', value: approved.length, color: 'text-green-400' },
          { label: 'Declined', value: declined.length, color: 'text-destructive' },
          { label: 'Total Days Approved', value: totalApprovedDays, color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock size={18} className="text-yellow-400" />
          Pending Requests ({pending.length})
        </h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : pending.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {pending.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">{getEmployeeName(req.employeeId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    {' '}({daysBetween(req.startDate, req.endDate) + 1} day{daysBetween(req.startDate, req.endDate) !== 0 ? 's' : ''})
                  </p>
                  {req.reason && <p className="text-xs text-muted-foreground italic">{req.reason}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(req.id)} disabled={updateStatus.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle size={14} className="mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDecline(req.id)} disabled={updateStatus.isPending}>
                    <XCircle size={14} className="mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Requests */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">All Requests</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(requests || []).sort((a, b) => Number(b.createdAt - a.createdAt)).map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="font-medium text-foreground text-sm">{getEmployeeName(req.employeeId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(req.startDate)} – {formatDate(req.endDate)}
                  </p>
                  {req.reason && <p className="text-xs text-muted-foreground italic">{req.reason}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[req.status]}`}>
                  {req.status}
                </span>
              </div>
            ))}
            {(requests || []).length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No requests yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
