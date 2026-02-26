import { useState } from 'react';
import { Plus, Pencil, AlertTriangle, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetTrainingRecords } from '@/hooks/useQueries';
import { formatDate, isExpiringSoon, isExpired } from '@/lib/utils';
import AddTrainingModal from './AddTrainingModal';
import EditTrainingModal from './EditTrainingModal';
import type { TrainingRecord } from '@/backend';
import { TrainingStatus } from '@/backend';

interface Props {
  employeeId: string;
}

function StatusBadge({ status }: { status: TrainingStatus }) {
  if (status === TrainingStatus.completed) {
    return <Badge className="bg-green-500/20 text-green-400 border-0 gap-1 text-xs"><CheckCircle2 size={11} />Completed</Badge>;
  }
  if (status === TrainingStatus.inProgress) {
    return <Badge className="bg-blue-500/20 text-blue-400 border-0 gap-1 text-xs"><Clock size={11} />In Progress</Badge>;
  }
  return <Badge variant="secondary" className="gap-1 text-xs"><Clock size={11} />Pending</Badge>;
}

export default function TrainingTab({ employeeId }: Props) {
  const { data: records = [], isLoading } = useGetTrainingRecords(employeeId);
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState<TrainingRecord | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">Training & Knowledge Records</h2>
        <Button
          size="sm"
          onClick={() => setShowAdd(true)}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus size={14} />
          Add Training
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <BookOpen className="mx-auto text-muted-foreground mb-3" size={32} />
          <p className="font-medium text-foreground mb-1">No training records</p>
          <p className="text-sm text-muted-foreground">
            Add training and knowledge records for this employee.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            // Guard against undefined/null expiryDate before calling isExpired/isExpiringSoon
            const expired = record.expiryDate != null ? isExpired(record.expiryDate) : false;
            const expiring = record.expiryDate != null ? isExpiringSoon(record.expiryDate) : false;
            return (
              <div
                key={record.id}
                className={`bg-card rounded-xl border shadow-xs p-4 flex items-start justify-between gap-4 ${
                  expired
                    ? 'border-destructive/30'
                    : expiring
                    ? 'border-yellow-500/40'
                    : 'border-border'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground text-sm">
                      {record.title}
                    </h3>
                    <StatusBadge status={record.status} />
                    {expired && (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <AlertTriangle size={10} />
                        Expired
                      </Badge>
                    )}
                    {!expired && expiring && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-0 gap-1 text-xs">
                        <AlertTriangle size={10} />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                  {record.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {record.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {record.completionDate != null && (
                      <span>Completed: {formatDate(record.completionDate)}</span>
                    )}
                    {record.expiryDate != null && (
                      <span>Expires: {formatDate(record.expiryDate)}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditRecord(record)}
                >
                  <Pencil size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <AddTrainingModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        employeeId={employeeId}
      />
      {editRecord && (
        <EditTrainingModal
          record={editRecord}
          open={!!editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}
    </div>
  );
}
