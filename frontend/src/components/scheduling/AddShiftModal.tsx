import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAddShift } from '@/hooks/useQueries';
import { generateId, dateToTimestamp, dateTimeToTimestamp } from '@/lib/utils';
import type { Employee } from '@/backend';

interface Props {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
}

export default function AddShiftModal({ open, onClose, employees }: Props) {
  const [form, setForm] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    department: '',
  });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const addShift = useAddShift();

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.department) { toast.error('Date and department are required.'); return; }
    try {
      await addShift.mutateAsync({
        id: generateId(),
        date: dateToTimestamp(form.date),
        startTime: dateTimeToTimestamp(form.date, form.startTime),
        endTime: dateTimeToTimestamp(form.date, form.endTime),
        department: form.department,
        assignedEmployees: selectedEmployees,
      });
      toast.success('Shift created.');
      setForm({ date: '', startTime: '09:00', endTime: '17:00', department: '' });
      setSelectedEmployees([]);
      onClose();
    } catch {
      toast.error('Failed to create shift.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display">Create New Shift</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 space-y-1.5">
              <Label>Department / Role *</Label>
              <Input value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} placeholder="e.g. Customer Service" />
            </div>
            <div className="col-span-3 space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
            </div>
          </div>

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>Assign Employees</Label>
            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedEmployees.map((id) => {
                  const emp = employees.find((e) => e.id === id);
                  return emp ? (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {emp.fullName}
                      <button type="button" onClick={() => toggleEmployee(id)} className="ml-1 hover:text-destructive">
                        <X size={10} />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            <div className="border border-border rounded-lg max-h-40 overflow-y-auto">
              {employees.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">No active employees available.</p>
              ) : (
                employees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleEmployee(emp.id)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/50 transition-colors ${selectedEmployees.includes(emp.id) ? 'bg-teal-light/30 text-teal-dark' : ''}`}
                  >
                    <span>{emp.fullName}</span>
                    <span className="text-xs text-muted-foreground">{emp.jobTitle}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addShift.isPending} className="bg-teal hover:bg-teal-dark text-white">
              {addShift.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
