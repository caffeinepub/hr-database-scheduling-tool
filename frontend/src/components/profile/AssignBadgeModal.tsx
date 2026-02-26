import React, { useState, useMemo } from 'react';
import { Search, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetBadges, useAssignBadgeToStaff } from '../../hooks/useQueries';
import type { Badge } from '../../backend';

interface AssignBadgeModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  assignedBy: string;
}

const categoryColors: Record<string, string> = {
  Attendance: 'border-green-300 bg-green-50 hover:bg-green-100',
  Performance: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
  Experience: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
  Team: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
  Milestone: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
};

const categorySelectedColors: Record<string, string> = {
  Attendance: 'border-green-500 bg-green-100 ring-2 ring-green-400',
  Performance: 'border-blue-500 bg-blue-100 ring-2 ring-blue-400',
  Experience: 'border-purple-500 bg-purple-100 ring-2 ring-purple-400',
  Team: 'border-orange-500 bg-orange-100 ring-2 ring-orange-400',
  Milestone: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-400',
};

export default function AssignBadgeModal({ open, onClose, employeeId, assignedBy }: AssignBadgeModalProps) {
  const [search, setSearch] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [note, setNote] = useState('');

  const { data: badges, isLoading } = useGetBadges();
  const assignBadge = useAssignBadgeToStaff();

  const filteredBadges = useMemo(() => {
    if (!badges) return [];
    const q = search.toLowerCase();
    return badges.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }, [badges, search]);

  const groupedBadges = useMemo(() => {
    const groups: Record<string, Badge[]> = {};
    filteredBadges.forEach((badge) => {
      if (!groups[badge.category]) groups[badge.category] = [];
      groups[badge.category].push(badge);
    });
    return groups;
  }, [filteredBadges]);

  const handleSubmit = async () => {
    if (!selectedBadge) return;

    const assignment = {
      id: `sb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      employeeId,
      badgeId: selectedBadge.id,
      assignedBy,
      assignedAt: BigInt(Date.now()),
      note: note.trim() || undefined,
    };

    await assignBadge.mutateAsync(assignment);
    onClose();
  };

  const handleClose = () => {
    setSearch('');
    setSelectedBadge(null);
    setNote('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl tracking-wide">
            <Award size={22} style={{ color: 'oklch(0.48 0.22 27)' }} />
            Assign Achievement Badge
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search badges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        {/* Badge list */}
        <ScrollArea className="flex-1 min-h-0 max-h-80">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading badges...</div>
          ) : Object.keys(groupedBadges).length === 0 ? (
            <div className="text-center py-8 text-gray-400">No badges found</div>
          ) : (
            <div className="space-y-4 pr-2">
              {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categoryBadges.map((badge) => {
                      const isSelected = selectedBadge?.id === badge.id;
                      const baseColors = categoryColors[category] ?? 'border-gray-200 bg-gray-50 hover:bg-gray-100';
                      const selectedClass = categorySelectedColors[category] ?? 'border-gray-400 bg-gray-100 ring-2 ring-gray-400';

                      return (
                        <button
                          key={badge.id}
                          onClick={() => setSelectedBadge(isSelected ? null : badge)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected ? selectedClass : baseColors
                          }`}
                        >
                          <span className="text-2xl flex-shrink-0">{badge.iconKey}</span>
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">{badge.name}</div>
                            <div className="text-xs text-gray-500 truncate">{badge.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Selected badge preview */}
        {selectedBadge && (
          <div
            className="rounded-lg p-3 border-2 flex items-center gap-3"
            style={{ borderColor: 'oklch(0.48 0.22 27)', backgroundColor: 'oklch(0.97 0.01 27)' }}
          >
            <span className="text-3xl">{selectedBadge.iconKey}</span>
            <div>
              <div className="font-semibold text-gray-900">{selectedBadge.name}</div>
              <div className="text-sm text-gray-600">{selectedBadge.description}</div>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="badge-note" className="text-sm font-medium text-gray-700">
            Manager Note <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="badge-note"
            placeholder="Add a personal note about why this badge is being awarded..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="bg-white resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={assignBadge.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedBadge || assignBadge.isPending}
            style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
          >
            {assignBadge.isPending ? 'Assigning...' : 'Assign Badge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
