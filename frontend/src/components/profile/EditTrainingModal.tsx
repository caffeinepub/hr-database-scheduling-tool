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
import { useUpdateTrainingRecord } from '@/hooks/useQueries';
import { dateToTimestamp, timestampToDateInput } from '@/lib/utils';
import { TrainingStatus } from '@/backend';
import type { TrainingRecord } from '@/backend';

interface Props {
  record: TrainingRecord;
  open: boolean;
  onClose: () => void;
}

export default function EditTrainingModal({ record, open, onClose }: Props) {
  const [form, setForm] = useState({
    title: record.title,
    description: record.description,
    completionDate: record.completionDate != null ? timestampToDateInput(record.completionDate) : '',
    expiryDate: record.expiryDate != null ? timestampToDateInput(record.expiryDate) : '',
    status: record.status,
  });
  const updateTraining = useUpdateTrainingRecord();

  useEffect(() => {
    setForm({
      title: record.title,
      description: record.description,
      completionDate: record.completionDate != null ? timestampToDateInput(record.completionDate) : '',
      expiryDate: record.expiryDate != null ? timestampToDateInput(record.expiryDate) : '',
      status: record.status,
    });
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required.'); return; }
    try {
      await updateTraining.mutateAsync({
        ...record,
        title: form.title,
        description: form.description,
        completionDate: form.completionDate ? dateToTimestamp(form.completionDate) : undefined,
        expiryDate: form.expiryDate ? dateToTimestamp(form.expiryDate) : undefined,
        status: form.status,
      });
      toast.success('Training record updated.');
      onClose();
    } catch {
      toast.error('Failed to update training record.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Training Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-foreground">Title *</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="bg-input border-border text-foreground" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="bg-input border-border text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-foreground">Completion Date</Label>
              <Input type="date" value={form.completionDate} onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))} className="bg-input border-border text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground">Expiry Date</Label>
              <Input type="date" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} className="bg-input border-border text-foreground" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as TrainingStatus }))}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value={TrainingStatus.pending}>Pending</SelectItem>
                <SelectItem value={TrainingStatus.inProgress}>In Progress</SelectItem>
                <SelectItem value={TrainingStatus.completed}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground">Cancel</Button>
            <Button type="submit" disabled={updateTraining.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {updateTraining.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
