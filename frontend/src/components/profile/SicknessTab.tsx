import { useState } from 'react';
import { Plus, Pencil, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetSicknessRecords } from '@/hooks/useQueries';
import { formatDate, daysBetween } from '@/lib/utils';
import AddSicknessModal from './AddSicknessModal';
import EditSicknessModal from './EditSicknessModal';
import type { SicknessRecord } from '@/backend';

interface Props {
  employeeId: string;
}

export default function SicknessTab({ employeeId }: Props) {
  const { data: records = [], isLoading } = useGetSicknessRecords(employeeId);
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState<SicknessRecord | null>(null);

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>;
  }

  const totalDays = records.reduce((sum, r) => sum + daysBetween(r.absenceStartDate, r.absenceEndDate), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-semibold text-foreground">Sickness Records</h2>
          {records.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{records.length} records · {totalDays} total days absent</p>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2 bg-teal hover:bg-teal-dark text-white">
          <Plus size={14} />
          Add Record
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <Activity className="mx-auto text-muted-foreground mb-3" size={32} />
          <p className="font-medium text-foreground mb-1">No sickness records</p>
          <p className="text-sm text-muted-foreground">Sickness and absence records will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records
            .slice()
            .sort((a, b) => Number(b.absenceStartDate) - Number(a.absenceStartDate))
            .map((record) => {
              const days = daysBetween(record.absenceStartDate, record.absenceEndDate);
              return (
                <div key={record.id} className="bg-card rounded-xl border border-border shadow-card p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-sm text-foreground">
                        {formatDate(record.absenceStartDate)} — {formatDate(record.absenceEndDate)}
                      </span>
                      <span className="text-xs bg-warning-bg text-warning px-2 py-0.5 rounded-full font-medium">
                        {days} day{days !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {record.reason && <p className="text-sm text-muted-foreground mb-1"><span className="font-medium text-foreground/70">Reason:</span> {record.reason}</p>}
                    {record.returnNote && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/70">Return note:</span> {record.returnNote}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={() => setEditRecord(record)}>
                    <Pencil size={14} />
                  </Button>
                </div>
              );
            })}
        </div>
      )}

      <AddSicknessModal open={showAdd} onClose={() => setShowAdd(false)} employeeId={employeeId} />
      {editRecord && (
        <EditSicknessModal record={editRecord} open={!!editRecord} onClose={() => setEditRecord(null)} />
      )}
    </div>
  );
}
