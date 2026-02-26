import { useState } from 'react';
import { useUpdateManagerNote } from '../../hooks/useQueries';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ManagerNoteType } from '../../backend';
import type { ManagerNote } from '../../backend';
import { toast } from 'sonner';

interface Props {
  note: ManagerNote;
  onClose: () => void;
}

export default function EditManagerNoteModal({ note, onClose }: Props) {
  const updateNote = useUpdateManagerNote();
  const [noteType, setNoteType] = useState<ManagerNoteType>(note.noteType);
  const [content, setContent] = useState(note.content);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Note content is required.');
      return;
    }
    try {
      await updateNote.mutateAsync({
        ...note,
        noteType,
        content: content.trim(),
      });
      toast.success('Note updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update note');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Manager Note</DialogTitle>
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
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateNote.isPending}>
              {updateNote.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
