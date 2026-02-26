import { useState } from 'react';
import {
  useGetManagerNotesByEmployee,
  useDeleteManagerNote,
  useGetAllEmployees,
  useGetCallerUserProfile,
} from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, StickyNote } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { ManagerNoteType } from '../../backend';
import type { ManagerNote } from '../../backend';
import AddManagerNoteModal from './AddManagerNoteModal';
import EditManagerNoteModal from './EditManagerNoteModal';
import { toast } from 'sonner';

interface Props {
  employeeId: string;
}

const noteTypeConfig: Record<ManagerNoteType, { label: string; className: string }> = {
  [ManagerNoteType.general]: { label: 'General', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  [ManagerNoteType.concern]: { label: 'Concern', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  [ManagerNoteType.sickness]: { label: 'Sickness', className: 'bg-red-100 text-red-800 border-red-200' },
  [ManagerNoteType.performance]: { label: 'Performance', className: 'bg-purple-100 text-purple-800 border-purple-200' },
};

export default function ManagerNotesTab({ employeeId }: Props) {
  const { data: notes, isLoading } = useGetManagerNotesByEmployee(employeeId);
  const { data: employees } = useGetAllEmployees();
  const { data: userProfile } = useGetCallerUserProfile();
  const deleteNote = useDeleteManagerNote();

  const [filterType, setFilterType] = useState<ManagerNoteType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ManagerNote | null>(null);

  const getAuthorName = (authorId: string) =>
    employees?.find((e) => e.id === authorId)?.fullName ?? 'Unknown';

  const filtered = (notes || []).filter(
    (n) => filterType === 'all' || n.noteType === filterType
  ).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const handleDelete = async (note: ManagerNote) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote.mutateAsync({ id: note.id, employeeId: note.employeeId });
      toast.success('Note deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete note');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as ManagerNoteType | 'all')}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={ManagerNoteType.general}>General</SelectItem>
              <SelectItem value={ManagerNoteType.concern}>Concern</SelectItem>
              <SelectItem value={ManagerNoteType.sickness}>Sickness</SelectItem>
              <SelectItem value={ManagerNoteType.performance}>Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Note
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <StickyNote className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No manager notes found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => {
            const config = noteTypeConfig[note.noteType];
            return (
              <Card key={note.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {getAuthorName(note.authorEmployeeId)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => setEditingNote(note)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(note)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddManagerNoteModal
          employeeId={employeeId}
          authorEmployeeId={userProfile?.employeeId ?? ''}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingNote && (
        <EditManagerNoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  );
}
