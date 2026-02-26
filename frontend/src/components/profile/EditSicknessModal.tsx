import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddSicknessRecord } from '@/hooks/useQueries';
import { generateId, dateToTimestamp, timestampToDateInput } from '@/lib/utils';
import type { SicknessRecord } from '@/backend';

interface Props {
  record: SicknessRecord;
  open: boolean;
  onClose: () => void;
}

// Note: backend doesn't expose updateSicknessRecord, so we add a new record as a workaround
export default function EditSicknessModal({ record, open, onClose }: Props) {
  const [form, setForm] = useState({
    absenceStartDate: timestampToDateInput(record.absenceStartDate),
    absenceEndDate: timestampToDateInput(record.absenceEndDate),
    reason: record.reason,
    returnNote: record.returnNote,
  });
  const addSickness = useAddSicknessRecord();

  useEffect(() => {
    setForm({
      absenceStartDate: timestampToDateInput(record.absenceStartDate),
      absenceEndDate: timestampToDateInput(record.absenceEndDate),
      reason: record.reason,
      returnNote: record.returnNote,
    });
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.absenceStartDate || !form.absenceEndDate) { toast.error('Start and end dates are required.'); return; }
    try {
      // Since there's no updateSicknessRecord, we add a corrected record
      await addSickness.mutateAsync({
        id: generateId(),
        employeeId: record.employeeId,
        absenceStartDate: dateToTimestamp(form.absenceStartDate),
        absenceEndDate: dateToTimestamp(form.absenceEndDate),
        reason: form.reason,
        returnNote: form.returnNote,
      });
      toast.success('Sickness record updated (new entry created).');
      onClose();
    } catch {
      toast.error('Failed to update sickness record.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display">Edit Sickness Record</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input type="date" value={form.absenceStartDate} onChange={(e) => setForm((p) => ({ ...p, absenceStartDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Input type="date" value={form.absenceEndDate} onChange={(e) => setForm((p) => ({ ...p, absenceEndDate: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Return to Work Note</Label>
            <Textarea value={form.returnNote} onChange={(e) => setForm((p) => ({ ...p, returnNote: e.target.value }))} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addSickness.isPending} className="bg-teal hover:bg-teal-dark text-white">
              {addSickness.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
