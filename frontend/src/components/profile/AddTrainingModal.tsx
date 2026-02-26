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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAddTrainingRecord } from '@/hooks/useQueries';
import { generateId, dateToTimestamp } from '@/lib/utils';
import { TrainingStatus } from '@/backend';

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
}

export default function AddTrainingModal({ open, onClose, employeeId }: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    completionDate: '',
    expiryDate: '',
    status: TrainingStatus.pending as TrainingStatus,
  });
  const addTraining = useAddTrainingRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required.'); return; }
    try {
      await addTraining.mutateAsync({
        id: generateId(),
        employeeId,
        title: form.title,
        description: form.description,
        completionDate: form.completionDate ? dateToTimestamp(form.completionDate) : undefined,
        expiryDate: form.expiryDate ? dateToTimestamp(form.expiryDate) : undefined,
        status: form.status,
      });
      toast.success('Training record added.');
      setForm({ title: '', description: '', completionDate: '', expiryDate: '', status: TrainingStatus.pending });
      onClose();
    } catch {
      toast.error('Failed to add training record.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display">Add Training Record</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Fire Safety Training" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Completion Date</Label>
              <Input type="date" value={form.completionDate} onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as TrainingStatus }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={TrainingStatus.pending}>Pending</SelectItem>
                <SelectItem value={TrainingStatus.inProgress}>In Progress</SelectItem>
                <SelectItem value={TrainingStatus.completed}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addTraining.isPending} className="bg-teal hover:bg-teal-dark text-white">
              {addTraining.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
