import React, { useState } from 'react';
import { useGetTrainingRecordsByEmployee, useIsCallerAdmin, useDeleteTrainingRecord } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Plus, BookOpen, CheckCircle, Clock, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import AddTrainingModal from './AddTrainingModal';
import EditTrainingModal from './EditTrainingModal';
import type { TrainingRecord } from '../../backend';
import { TrainingStatus } from '../../backend';

interface TrainingTabProps {
  employeeId: string;
}

function formatDate(ts?: bigint): string {
  if (ts == null) return '—';
  return new Date(Number(ts) / 1_000_000).toLocaleDateString('en-GB');
}

function StatusBadge({ status }: { status: TrainingRecord['status'] }) {
  if (status === TrainingStatus.completed) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 gap-1">
        <CheckCircle className="w-3 h-3" />
        Completed
      </Badge>
    );
  }
  if (status === TrainingStatus.inProgress) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="w-3 h-3" />
        In Progress
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="w-3 h-3" />
      Pending
    </Badge>
  );
}

export default function TrainingTab({ employeeId }: TrainingTabProps) {
  const { data: records = [], isLoading } = useGetTrainingRecordsByEmployee(employeeId);
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteRecord = useDeleteTrainingRecord();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<TrainingRecord | null>(null);

  const isExpired = (ts?: bigint) => {
    if (ts == null) return false;
    return Number(ts) / 1_000_000 < Date.now();
  };

  const isExpiringSoon = (ts?: bigint) => {
    if (ts == null) return false;
    const ms = Number(ts) / 1_000_000;
    return ms > Date.now() && ms < Date.now() + 30 * 24 * 60 * 60 * 1000;
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    try {
      await deleteRecord.mutateAsync({ recordId: deletingRecord.id, employeeId });
      setDeletingRecord(null);
    } catch {
      // error handled by toast in mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg text-foreground">Training Records</h3>
          <Badge variant="outline">{records.length}</Badge>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Record
          </Button>
        )}
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No training records found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record) => {
            const expired = isExpired(record.expiryDate);
            const expiringSoon = isExpiringSoon(record.expiryDate);

            return (
              <div
                key={record.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground">{record.title}</h4>
                      <StatusBadge status={record.status} />
                      {expired && record.expiryDate != null && (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          Expired
                        </Badge>
                      )}
                      {!expired && expiringSoon && record.expiryDate != null && (
                        <Badge
                          variant="outline"
                          className="gap-1 text-xs border-amber-400 text-amber-600"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    {record.description && (
                      <p className="text-sm text-muted-foreground mt-1">{record.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {record.completionDate != null && (
                        <span>Completed: {formatDate(record.completionDate)}</span>
                      )}
                      {record.expiryDate != null && (
                        <span
                          className={
                            expired
                              ? 'text-destructive'
                              : expiringSoon
                              ? 'text-amber-600'
                              : ''
                          }
                        >
                          Expires: {formatDate(record.expiryDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingRecord(record)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeletingRecord(record)}
                        disabled={deleteRecord.isPending && deletingRecord?.id === record.id}
                      >
                        {deleteRecord.isPending && deletingRecord?.id === record.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddTrainingModal
          employeeId={employeeId}
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <EditTrainingModal
          record={editingRecord}
          open={!!editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingRecord}
        onOpenChange={(open) => !open && setDeletingRecord(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the training record{' '}
              <strong>"{deletingRecord?.title}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRecord.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteRecord.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecord.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
