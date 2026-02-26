import { useState } from 'react';
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
import { generateId, dateToTimestamp } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
}

export default function AddSicknessModal({ open, onClose, employeeId }: Props) {
  const [form, setForm] = useState({ absenceStartDate: '', absenceEndDate: '', reason: '', returnNote: '' });
  const addSickness = useAddSicknessRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.absenceStartDate || !form.absenceEndDate) { toast.error('Start and end dates are required.'); return; }
    try {
      await addSickness.mutateAsync({
        id: generateId(),
        employeeId,
        absenceStartDate: dateToTimestamp(form.absenceStartDate),
        absenceEndDate: dateToTimestamp(form.absenceEndDate),
        reason: form.reason,
        returnNote: form.returnNote,
      });
      toast.success('Sickness record added.');
      setForm({ absenceStartDate: '', absenceEndDate: '', reason: '', returnNote: '' });
      onClose();
    } catch {
      toast.error('Failed to add sickness record.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display">Add Sickness Record</DialogTitle></DialogHeader>
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
            <Textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason for absence..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Return to Work Note</Label>
            <Textarea value={form.returnNote} onChange={(e) => setForm((p) => ({ ...p, returnNote: e.target.value }))} placeholder="Notes on return to work..." rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addSickness.isPending} className="bg-teal hover:bg-teal-dark text-white">
              {addSickness.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
