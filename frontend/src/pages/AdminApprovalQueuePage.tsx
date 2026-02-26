import React from "react";
import { useListApprovals, useSetApproval, useIsCallerAdmin } from "../hooks/useQueries";
import { ApprovalStatus } from "../backend";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminApprovalQueuePage() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: approvals, isLoading } = useListApprovals();
  const setApproval = useSetApproval();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (principal: any) => {
    try {
      await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.approved });
      toast.success("User approved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve user");
    }
  };

  const handleReject = async (principal: any) => {
    try {
      await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.rejected });
      toast.success("User rejected");
    } catch (err: any) {
      toast.error(err.message || "Failed to reject user");
    }
  };

  const pending = approvals?.filter((a) => a.status === ApprovalStatus.pending) || [];
  const approved = approvals?.filter((a) => a.status === ApprovalStatus.approved) || [];
  const rejected = approvals?.filter((a) => a.status === ApprovalStatus.rejected) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Approval Queue</h2>
        <p className="text-muted-foreground">Manage staff account access requests</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={18} className="text-yellow-500" />
              Pending Approval ({pending.length})
            </h3>
            {pending.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {pending.map((approval) => (
                  <div key={approval.principal.toString()} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {approval.principal.toString().substring(0, 20)}...
                      </p>
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs mt-1">
                        Pending
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(approval.principal)}
                        disabled={setApproval.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(approval.principal)}
                        disabled={setApproval.isPending}
                      >
                        <XCircle size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" />
              Approved ({approved.length})
            </h3>
            {approved.length === 0 ? (
              <p className="text-muted-foreground text-sm">No approved users</p>
            ) : (
              <div className="space-y-2">
                {approved.map((approval) => (
                  <div key={approval.principal.toString()} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-foreground">
                      {approval.principal.toString().substring(0, 30)}...
                    </p>
                    <Badge className="bg-green-600 text-white text-xs">Approved</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rejected */}
          {rejected.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <XCircle size={18} className="text-destructive" />
                Rejected ({rejected.length})
              </h3>
              <div className="space-y-2">
                {rejected.map((approval) => (
                  <div key={approval.principal.toString()} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-foreground">
                      {approval.principal.toString().substring(0, 30)}...
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">Rejected</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(approval.principal)}
                        disabled={setApproval.isPending}
                        className="text-xs border-border"
                      >
                        Re-approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
