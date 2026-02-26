import React, { useState } from 'react';
import {
  useGetManagerNotesByEmployee,
  useDeleteManagerNote,
  useGetAllEmployees,
  useGetCallerUserProfile,
} from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, StickyNote } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { ManagerNoteType } from '../../backend';
import type { ManagerNote, Employee } from '../../backend';
import AddManagerNoteModal from './AddManagerNoteModal';
import EditManagerNoteModal from './EditManagerNoteModal';
import { toast } from 'sonner';

interface Props {
  employeeId: string;
  isAdmin?: boolean;
  employees?: Employee[];
}

const noteTypeConfig: Record<ManagerNoteType, { label: string; className: string }> = {
  [ManagerNoteType.general]: {
    label: 'General',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [ManagerNoteType.concern]: {
    label: 'Concern',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  [ManagerNoteType.sickness]: {
    label: 'Sickness',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  [ManagerNoteType.performance]: {
    label: 'Performance',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

export default function ManagerNotesTab({ employeeId, isAdmin, employees: employeesProp }: Props) {
  const { data: notes, isLoading } = useGetManagerNotesByEmployee(employeeId);
  const { data: fetchedEmployees } = useGetAllEmployees();
  const { data: userProfile } = useGetCallerUserProfile();
  const deleteNote = useDeleteManagerNote();

  const employees = employeesProp ?? fetchedEmployees ?? [];

  const [filterType, setFilterType] = useState<ManagerNoteType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ManagerNote | null>(null);

  const getAuthorName = (authorId: string) =>
    employees.find((e) => e.id === authorId)?.fullName ?? 'Unknown';

  const filtered = (notes || [])
    .filter((n) => filterType === 'all' || n.noteType === filterType)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const handleDelete = async (note: ManagerNote) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote.mutateAsync(note.id);
      toast.success('Note deleted');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete note');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Select
          value={filterType}
          onValueChange={(v) => setFilterType(v as ManagerNoteType | 'all')}
        >
          <SelectTrigger className="w-40 h-8 text-sm bg-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={ManagerNoteType.general}>General</SelectItem>
            <SelectItem value={ManagerNoteType.concern}>Concern</SelectItem>
            <SelectItem value={ManagerNoteType.sickness}>Sickness</SelectItem>
            <SelectItem value={ManagerNoteType.performance}>Performance</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
        >
          <Plus size={14} className="mr-1" />
          Add Note
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <StickyNote size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No manager notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => {
            const config = noteTypeConfig[note.noteType];
            return (
              <Card key={note.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.className}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(note.createdAt)}
                        </span>
                        <span className="text-xs text-gray-400">
                          by {getAuthorName(note.authorEmployeeId)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-gray-400 hover:text-gray-700"
                          onClick={() => setEditingNote(note)}
                        >
                          <Pencil size={13} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-gray-400 hover:text-red-600"
                          onClick={() => handleDelete(note)}
                          disabled={deleteNote.isPending}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    )}
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
