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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddAppraisalRecord } from '@/hooks/useQueries';
import { generateId, dateToTimestamp, timestampToDateInput } from '@/lib/utils';
import { AppraisalType } from '@/backend';
import type { AppraisalRecord } from '@/backend';

interface Props {
  record: AppraisalRecord;
  open: boolean;
  onClose: () => void;
}

// Note: backend doesn't expose updateAppraisal, so we add a new record
export default function EditAppraisalModal({ record, open, onClose }: Props) {
  const [form, setForm] = useState({
    scheduledDate: timestampToDateInput(record.scheduledDate),
    appraisalType: record.appraisalType,
    notes: record.notes,
    isComplete: record.isComplete,
  });
  const addAppraisal = useAddAppraisalRecord();

  useEffect(() => {
    setForm({
      scheduledDate: timestampToDateInput(record.scheduledDate),
      appraisalType: record.appraisalType,
      notes: record.notes,
      isComplete: record.isComplete,
    });
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scheduledDate) { toast.error('Scheduled date is required.'); return; }
    try {
      await addAppraisal.mutateAsync({
        id: generateId(),
        employeeId: record.employeeId,
        scheduledDate: dateToTimestamp(form.scheduledDate),
        appraisalType: form.appraisalType,
        notes: form.notes,
        isComplete: form.isComplete,
      });
      toast.success('Appraisal updated (new entry created).');
      onClose();
    } catch {
      toast.error('Failed to update appraisal.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display">Edit Appraisal</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Scheduled Date *</Label>
              <Input type="date" value={form.scheduledDate} onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.appraisalType} onValueChange={(v) => setForm((p) => ({ ...p, appraisalType: v as AppraisalType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppraisalType.annual}>Annual</SelectItem>
                  <SelectItem value={AppraisalType.midYear}>Mid-Year</SelectItem>
                  <SelectItem value={AppraisalType.probationary}>Probationary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={4} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-isComplete"
              checked={form.isComplete}
              onCheckedChange={(v) => setForm((p) => ({ ...p, isComplete: !!v }))}
            />
            <Label htmlFor="edit-isComplete" className="cursor-pointer">Mark as completed</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addAppraisal.isPending} className="bg-teal hover:bg-teal-dark text-white">
              {addAppraisal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
