import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useUpdateTrainingRecord } from '../../hooks/useQueries';
import type { TrainingRecord } from '../../backend';
import { TrainingStatus } from '../../backend';

const EXPERIENCE_NAMES = [
  'The Happy Institute',
  'The Dollhouse',
  'Wizard Of Oz',
  'Break The Bank',
  'Marvellous Magic School',
  'Riddled',
  'Hell House',
  "The Don's Revenge",
  'Whodunit',
  'Battle Masters',
  'Time Raiders',
  'Laser Quest',
  'Retro Arcade',
  '7 Sins',
  'CSI Disco',
  'CSI Mafia',
  'Karaoke Lounge',
  'Karaoke Disco',
  'Like TV Game Show',
  'Splatter Room',
];

interface EditTrainingModalProps {
  record: TrainingRecord;
  open: boolean;
  onClose: () => void;
}

function bigintToDateString(val?: bigint): string {
  if (!val) return '';
  return new Date(Number(val) / 1_000_000).toISOString().split('T')[0];
}

export default function EditTrainingModal({ record, open, onClose }: EditTrainingModalProps) {
  const updateRecord = useUpdateTrainingRecord();

  // Determine if the current title is in the predefined list or custom
  const isPredefined = EXPERIENCE_NAMES.includes(record.title);

  const [titleSelection, setTitleSelection] = useState(isPredefined ? record.title : '__custom__');
  const [customTitle, setCustomTitle] = useState(isPredefined ? '' : record.title);
  const [description, setDescription] = useState(record.description);
  const [status, setStatus] = useState<TrainingStatus>(record.status as TrainingStatus);
  const [completionDate, setCompletionDate] = useState(bigintToDateString(record.completionDate));
  const [expiryDate, setExpiryDate] = useState(bigintToDateString(record.expiryDate));

  // Reset when record changes
  useEffect(() => {
    const predefined = EXPERIENCE_NAMES.includes(record.title);
    setTitleSelection(predefined ? record.title : '__custom__');
    setCustomTitle(predefined ? '' : record.title);
    setDescription(record.description);
    setStatus(record.status as TrainingStatus);
    setCompletionDate(bigintToDateString(record.completionDate));
    setExpiryDate(bigintToDateString(record.expiryDate));
  }, [record]);

  const isCustom = titleSelection === '__custom__';
  const effectiveTitle = isCustom ? customTitle : titleSelection;

  const handleSubmit = async () => {
    if (!effectiveTitle.trim()) {
      toast.error('Please select or enter a training title');
      return;
    }

    const updated: TrainingRecord = {
      ...record,
      title: effectiveTitle.trim(),
      description: description.trim(),
      status,
      completionDate: completionDate
        ? BigInt(new Date(completionDate).getTime()) * 1_000_000n
        : undefined,
      expiryDate: expiryDate
        ? BigInt(new Date(expiryDate).getTime()) * 1_000_000n
        : undefined,
    };

    try {
      await updateRecord.mutateAsync(updated);
      toast.success('Training record updated');
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update training record');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Training Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Experience / Title Dropdown */}
          <div className="space-y-1">
            <Label>Experience / Training Title *</Label>
            <Select value={titleSelection} onValueChange={setTitleSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Select an experience..." />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Title Input */}
          {isCustom && (
            <div className="space-y-1">
              <Label htmlFor="edit-custom-title">Custom Title *</Label>
              <Input
                id="edit-custom-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter custom training title..."
                autoFocus
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="edit-training-description">Description</Label>
            <Textarea
              id="edit-training-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this training..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TrainingStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TrainingStatus.completed}>Completed</SelectItem>
                <SelectItem value={TrainingStatus.inProgress}>In Progress</SelectItem>
                <SelectItem value={TrainingStatus.pending}>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-completion-date">Completion Date</Label>
              <Input
                id="edit-completion-date"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-expiry-date">Expiry Date</Label>
              <Input
                id="edit-expiry-date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateRecord.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateRecord.isPending || !effectiveTitle.trim()}
          >
            {updateRecord.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
