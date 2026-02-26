import { useState } from 'react';
import { Plus, Pencil, ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAppraisals } from '@/hooks/useQueries';
import { formatDate } from '@/lib/utils';
import AddAppraisalModal from './AddAppraisalModal';
import EditAppraisalModal from './EditAppraisalModal';
import type { AppraisalRecord } from '@/backend';
import { AppraisalType } from '@/backend';

interface Props {
  employeeId: string;
}

const appraisalTypeLabel: Record<AppraisalType, string> = {
  [AppraisalType.annual]: 'Annual',
  [AppraisalType.midYear]: 'Mid-Year',
  [AppraisalType.probationary]: 'Probationary',
};

export default function AppraisalsTab({ employeeId }: Props) {
  const { data: records = [], isLoading } = useGetAppraisals(employeeId);
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState<AppraisalRecord | null>(null);

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-foreground">Appraisal Records</h2>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2 bg-teal hover:bg-teal-dark text-white">
          <Plus size={14} />
          Schedule Appraisal
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <ClipboardList className="mx-auto text-muted-foreground mb-3" size={32} />
          <p className="font-medium text-foreground mb-1">No appraisals scheduled</p>
          <p className="text-sm text-muted-foreground">Schedule appraisals and track their completion here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records
            .slice()
            .sort((a, b) => Number(b.scheduledDate) - Number(a.scheduledDate))
            .map((record) => (
              <div key={record.id} className="bg-card rounded-xl border border-border shadow-card p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-foreground">{formatDate(record.scheduledDate)}</span>
                    <Badge variant="outline" className="text-xs font-medium">{appraisalTypeLabel[record.appraisalType]}</Badge>
                    {record.isComplete ? (
                      <Badge className="bg-success-bg text-success border-0 gap-1 text-xs"><CheckCircle2 size={10} />Completed</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 text-xs"><Clock size={10} />Scheduled</Badge>
                    )}
                  </div>
                  {record.notes && <p className="text-sm text-muted-foreground line-clamp-2">{record.notes}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={() => setEditRecord(record)}>
                  <Pencil size={14} />
                </Button>
              </div>
            ))}
        </div>
      )}

      <AddAppraisalModal open={showAdd} onClose={() => setShowAdd(false)} employeeId={employeeId} />
      {editRecord && (
        <EditAppraisalModal record={editRecord} open={!!editRecord} onClose={() => setEditRecord(null)} />
      )}
    </div>
  );
}
