import { useState } from 'react';
import { useAddManagerNote } from '../../hooks/useQueries';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { generateId, dateToNanoseconds } from '../../lib/utils';
import { ManagerNoteType } from '../../backend';
import { toast } from 'sonner';

interface Props {
  employeeId: string;
  authorEmployeeId: string;
  onClose: () => void;
}

export default function AddManagerNoteModal({ employeeId, authorEmployeeId, onClose }: Props) {
  const addNote = useAddManagerNote();
  const [noteType, setNoteType] = useState<ManagerNoteType>(ManagerNoteType.general);
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Note content is required.');
      return;
    }
    if (!authorEmployeeId) {
      toast.error('Your account is not linked to an employee record. Cannot add note.');
      return;
    }
    try {
      await addNote.mutateAsync({
        id: generateId(),
        employeeId,
        authorEmployeeId,
        noteType,
        content: content.trim(),
        createdAt: dateToNanoseconds(new Date()),
      });
      toast.success('Note added successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add note');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Manager Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Note Type</Label>
            <Select value={noteType} onValueChange={(v) => setNoteType(v as ManagerNoteType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ManagerNoteType.general}>General</SelectItem>
                <SelectItem value={ManagerNoteType.concern}>Concern</SelectItem>
                <SelectItem value={ManagerNoteType.sickness}>Sickness</SelectItem>
                <SelectItem value={ManagerNoteType.performance}>Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content..."
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addNote.isPending}>
              {addNote.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
