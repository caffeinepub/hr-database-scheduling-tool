import { useState } from 'react';
import { Clock, Users, Building2, Plus, Pencil, Trash2, Loader2, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetShiftNotes, useAddShiftNote } from '@/hooks/useQueries';
import { formatDate, formatTime, formatDateTime, generateId } from '@/lib/utils';
import type { Shift, Employee, ShiftNote } from '@/backend';

interface Props {
  shift: Shift;
  open: boolean;
  onClose: () => void;
  employees: Employee[];
}

interface EditNoteFormProps {
  note: ShiftNote;
  assignedEmployees: Employee[];
  onCancel: () => void;
  onSaved: () => void;
}

function EditNoteForm({ note, assignedEmployees, onCancel, onSaved }: EditNoteFormProps) {
  const [text, setText] = useState(note.noteText);
  const [employeeId, setEmployeeId] = useState<string>(note.employeeId ?? '');
  const addShiftNote = useAddShiftNote();

  const handleSave = async () => {
    if (!text.trim()) {
      toast.error('Note text is required.');
      return;
    }
    try {
      await addShiftNote.mutateAsync({
        id: generateId(),
        shiftId: note.shiftId,
        noteText: text.trim(),
        employeeId: employeeId || undefined,
        createdTimestamp: BigInt(Date.now()) * 1_000_000n,
      });
      toast.success('Note updated (new entry created).');
      onSaved();
    } catch {
      toast.error('Failed to update note.');
    }
  };

  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="text-sm"
        autoFocus
      />
      {assignedEmployees.length > 0 && (
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger className="text-sm h-8">
            <SelectValue placeholder="Assign to employee (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No specific employee</SelectItem>
            {assignedEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={addShiftNote.isPending}
          className="bg-teal hover:bg-teal-dark text-white"
        >
          {addShiftNote.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}

export default function ShiftDetailModal({ shift, open, onClose, employees }: Props) {
  const { data: notes = [], isLoading: notesLoading } = useGetShiftNotes(shift.id);
  const addShiftNote = useAddShiftNote();

  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteEmployeeId, setNewNoteEmployeeId] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const assignedEmployees = employees.filter((e) => shift.assignedEmployees.includes(e.id));

  const getEmployeeName = (empId: string | undefined): string | null => {
    if (!empId) return null;
    const emp = employees.find((e) => e.id === empId);
    return emp ? emp.fullName : null;
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) {
      toast.error('Note text is required.');
      return;
    }
    try {
      await addShiftNote.mutateAsync({
        id: generateId(),
        shiftId: shift.id,
        noteText: newNoteText.trim(),
        employeeId: newNoteEmployeeId || undefined,
        createdTimestamp: BigInt(Date.now()) * 1_000_000n,
      });
      toast.success('Note added.');
      setNewNoteText('');
      setNewNoteEmployeeId('');
      setShowAddNote(false);
    } catch {
      toast.error('Failed to add note.');
    }
  };

  const sortedNotes = [...notes].sort(
    (a, b) => Number(b.createdTimestamp) - Number(a.createdTimestamp)
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Shift Details</DialogTitle>
        </DialogHeader>

        {/* Shift Info */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-medium gap-1">
              <Building2 size={11} />
              {shift.department}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(shift.date)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
            <Clock size={14} className="text-teal" />
            <span>
              {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
            </span>
          </div>
          {assignedEmployees.length > 0 && (
            <div className="flex items-start gap-1.5 text-sm text-foreground/80">
              <Users size={14} className="text-teal mt-0.5 flex-shrink-0" />
              <span>{assignedEmployees.map((e) => e.fullName).join(', ')}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Notes Section */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <StickyNote size={16} className="text-teal" />
            <h3 className="font-display font-semibold text-sm text-foreground">
              Tasks & Notes
            </h3>
            {notes.length > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {notes.length}
              </Badge>
            )}
          </div>
          {!showAddNote && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddNote(true)}
              className="gap-1.5 h-7 text-xs"
            >
              <Plus size={12} />
              Add Note
            </Button>
          )}
        </div>

        {/* Add Note Form */}
        {showAddNote && (
          <form onSubmit={handleAddNote} className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border flex-shrink-0">
            <div className="space-y-1.5">
              <Label className="text-xs">Note / Task *</Label>
              <Textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Enter task or note for this shift..."
                rows={3}
                className="text-sm"
                autoFocus
              />
            </div>
            {assignedEmployees.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Assign to Employee (optional)</Label>
                <Select value={newNoteEmployeeId} onValueChange={setNewNoteEmployeeId}>
                  <SelectTrigger className="text-sm h-8">
                    <SelectValue placeholder="No specific employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific employee</SelectItem>
                    {assignedEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddNote(false);
                  setNewNoteText('');
                  setNewNoteEmployeeId('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addShiftNote.isPending}
                className="bg-teal hover:bg-teal-dark text-white"
              >
                {addShiftNote.isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                Add Note
              </Button>
            </div>
          </form>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {notesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedNotes.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="mx-auto text-muted-foreground mb-2" size={28} />
              <p className="text-sm font-medium text-foreground mb-1">No notes yet</p>
              <p className="text-xs text-muted-foreground">
                Add tasks and duties for this shift.
              </p>
            </div>
          ) : (
            sortedNotes.map((note) => {
              const empName = getEmployeeName(note.employeeId);
              const isEditing = editingNoteId === note.id;

              return (
                <div key={note.id}>
                  {isEditing ? (
                    <EditNoteForm
                      note={note}
                      assignedEmployees={assignedEmployees}
                      onCancel={() => setEditingNoteId(null)}
                      onSaved={() => setEditingNoteId(null)}
                    />
                  ) : (
                    <div className="group bg-card rounded-lg border border-border p-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {note.noteText}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {empName && (
                            <span className="text-xs bg-teal-light text-teal-dark px-2 py-0.5 rounded-full font-medium">
                              {empName}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(note.createdTimestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingNoteId(note.id)}
                          title="Edit note"
                        >
                          <Pencil size={13} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
