import React, { useState } from 'react';
import { useGetAllShifts, useGetAllEmployees, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, Users, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatTime, getWeekDates, nanosecondsToDate, isSameDay, dateToNanoseconds, dateTimeToTimestamp, generateId } from '../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddShift, useUpdateShift, useDeleteShift } from '../hooks/useQueries';
import type { Shift, Employee } from '../backend';
import { toast } from 'sonner';

type Page = "dashboard" | "employees" | "employee-profile" | "scheduling" | "portal" | "stock-requests" | "inventory" | "eom" | "appraisals" | "training-summary" | "holiday-stats" | "payroll-export" | "approval-queue" | "documents" | "resources";

interface SchedulingPageProps {
  navigate: (page: Page) => void;
}

const DAY_NAMES = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

interface ShiftFormData {
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  location: string;
  notes: string;
  assignedEmployees: string[];
  shiftType: 'regular' | 'paid-leave' | 'unpaid-leave' | 'sickness';
}

const SHIFT_TYPE_COLORS: Record<string, string> = {
  'regular': 'bg-primary/20 text-primary border-primary/30',
  'paid-leave': 'bg-green-500/20 text-green-400 border-green-500/30',
  'unpaid-leave': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'sickness': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const SHIFT_TYPE_LABELS: Record<string, string> = {
  'regular': 'Regular',
  'paid-leave': 'Paid Leave',
  'unpaid-leave': 'Unpaid Leave',
  'sickness': 'Sickness',
};

function getShiftType(department: string): string {
  if (department.startsWith('[PAID-LEAVE]')) return 'paid-leave';
  if (department.startsWith('[UNPAID-LEAVE]')) return 'unpaid-leave';
  if (department.startsWith('[SICKNESS]')) return 'sickness';
  return 'regular';
}

function getDepartmentDisplay(department: string): string {
  return department
    .replace('[PAID-LEAVE] ', '')
    .replace('[UNPAID-LEAVE] ', '')
    .replace('[SICKNESS] ', '');
}

export default function SchedulingPage({ navigate }: SchedulingPageProps) {
  const { data: shifts, isLoading } = useGetAllShifts();
  const { data: employees } = useGetAllEmployees();
  const { data: isAdmin } = useIsCallerAdmin();

  const addShift = useAddShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();

  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekDates(new Date())[0]);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [form, setForm] = useState<ShiftFormData>({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    department: '',
    location: '',
    notes: '',
    assignedEmployees: [],
    shiftType: 'regular',
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const getShiftsForDay = (day: Date) =>
    (shifts || []).filter((s) => isSameDay(nanosecondsToDate(s.date), day));

  const openAddForDate = (date: Date) => {
    setSelectedDate(date);
    setForm({
      date: date.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      department: '',
      location: '',
      notes: '',
      assignedEmployees: [],
      shiftType: 'regular',
    });
    setShowAddModal(true);
  };

  const openEdit = (shift: Shift) => {
    const shiftDate = nanosecondsToDate(shift.date);
    const startDate = nanosecondsToDate(shift.startTime);
    const endDate = nanosecondsToDate(shift.endTime);
    const shiftType = getShiftType(shift.department);
    setEditingShift(shift);
    setForm({
      date: shiftDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().substring(0, 5),
      endTime: endDate.toTimeString().substring(0, 5),
      department: getDepartmentDisplay(shift.department),
      location: '',
      notes: '',
      assignedEmployees: [...shift.assignedEmployees],
      shiftType: shiftType as ShiftFormData['shiftType'],
    });
  };

  const buildDepartmentString = (type: string, dept: string) => {
    if (type === 'paid-leave') return `[PAID-LEAVE] ${dept}`;
    if (type === 'unpaid-leave') return `[UNPAID-LEAVE] ${dept}`;
    if (type === 'sickness') return `[SICKNESS] ${dept}`;
    return dept;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateNs = dateToNanoseconds(new Date(form.date + 'T00:00:00'));
      const startNs = dateTimeToTimestamp(form.date, form.startTime);
      const endNs = dateTimeToTimestamp(form.date, form.endTime);
      const deptStr = buildDepartmentString(form.shiftType, form.department);

      if (editingShift) {
        await updateShift.mutateAsync({
          ...editingShift,
          date: dateNs,
          startTime: startNs,
          endTime: endNs,
          department: deptStr,
          assignedEmployees: form.assignedEmployees,
        });
        toast.success('Shift updated');
        setEditingShift(null);
      } else {
        await addShift.mutateAsync({
          id: generateId(),
          date: dateNs,
          startTime: startNs,
          endTime: endNs,
          department: deptStr,
          assignedEmployees: form.assignedEmployees,
        });
        toast.success('Shift added');
        setShowAddModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save shift');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shift?')) return;
    try {
      await deleteShift.mutateAsync(id);
      toast.success('Shift deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete shift');
    }
  };

  const toggleEmployee = (empId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(empId)
        ? prev.assignedEmployees.filter((id) => id !== empId)
        : [...prev.assignedEmployees, empId],
    }));
  };

  const ShiftModal = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground text-sm">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
            </div>
            <div>
              <Label className="text-foreground text-sm">Shift Type</Label>
              <Select value={form.shiftType} onValueChange={(v) => setForm({ ...form, shiftType: v as ShiftFormData['shiftType'] })}>
                <SelectTrigger className="bg-input border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="regular">Regular Shift</SelectItem>
                  <SelectItem value="paid-leave">Paid Time Off</SelectItem>
                  <SelectItem value="unpaid-leave">Unpaid Time Off</SelectItem>
                  <SelectItem value="sickness">Sickness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-sm">Start Time</Label>
              <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
            </div>
            <div>
              <Label className="text-foreground text-sm">End Time</Label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
            </div>
          </div>
          <div>
            <Label className="text-foreground text-sm">Department / Location</Label>
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="bg-input border-border text-foreground mt-1" placeholder="e.g. Bar, FEC Cafe..." />
          </div>
          <div>
            <Label className="text-foreground text-sm">Assign Employees</Label>
            <div className="mt-1 max-h-40 overflow-y-auto space-y-1 border border-border rounded-lg p-2 bg-input">
              {(employees || []).map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 p-1 hover:bg-secondary rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.assignedEmployees.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{emp.fullName}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border text-foreground">Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={addShift.isPending || updateShift.isPending}>
              {(addShift.isPending || updateShift.isPending) ? 'Saving...' : 'Save Shift'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Rota & Scheduling</h2>
          <p className="text-muted-foreground">Thu – Wed weekly calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'day' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Day
            </button>
          </div>
          {isAdmin && (
            <Button onClick={() => openAddForDate(new Date())} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={16} className="mr-2" />
              Add Shift
            </Button>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <button onClick={prevWeek} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-foreground">
            {weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} –{' '}
            {weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground">Thu – Wed</p>
        </div>
        <button onClick={nextWeek} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : viewMode === 'week' ? (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((day, idx) => {
            const dayShifts = getShiftsForDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={idx}
                className={`bg-card border rounded-xl p-3 min-h-[160px] ${isToday ? 'border-primary' : 'border-border'}`}
              >
                <div className="text-center mb-2">
                  <p className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{DAY_NAMES[idx]}</p>
                  <p className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>{day.getDate()}</p>
                </div>
                <div className="space-y-1">
                  {dayShifts.map((shift) => {
                    const type = getShiftType(shift.department);
                    return (
                      <div
                        key={shift.id}
                        className={`text-xs p-1.5 rounded border cursor-pointer ${SHIFT_TYPE_COLORS[type]}`}
                        onClick={() => isAdmin && openEdit(shift)}
                      >
                        <p className="font-medium truncate">{getDepartmentDisplay(shift.department) || 'Shift'}</p>
                        <p className="opacity-80">{formatTime(shift.startTime)}–{formatTime(shift.endTime)}</p>
                        <p className="opacity-70">{shift.assignedEmployees.length} staff</p>
                      </div>
                    );
                  })}
                  {isAdmin && (
                    <button
                      onClick={() => openAddForDate(day)}
                      className="w-full text-xs text-muted-foreground hover:text-primary py-1 hover:bg-secondary rounded transition-colors"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Day View
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weekDates.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-colors ${isSameDay(day, selectedDay) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                {DAY_NAMES[idx]} {day.getDate()}
              </button>
            ))}
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {selectedDay.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {isAdmin && (
                <Button size="sm" onClick={() => openAddForDate(selectedDay)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus size={14} className="mr-1" />
                  Add Shift
                </Button>
              )}
            </div>
            {getShiftsForDay(selectedDay).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No shifts scheduled for this day</p>
            ) : (
              <div className="space-y-3">
                {getShiftsForDay(selectedDay).map((shift) => {
                  const type = getShiftType(shift.department);
                  const assignedNames = shift.assignedEmployees
                    .map((id) => employees?.find((e) => e.id === id)?.fullName || id)
                    .join(', ');
                  return (
                    <div key={shift.id} className={`p-4 rounded-xl border ${SHIFT_TYPE_COLORS[type]}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${SHIFT_TYPE_COLORS[type]}`}>{SHIFT_TYPE_LABELS[type]}</Badge>
                            <span className="font-semibold text-foreground">{getDepartmentDisplay(shift.department) || 'Shift'}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                          </p>
                          {assignedNames && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <Users size={12} className="inline mr-1" />
                              {assignedNames}
                            </p>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(shift)} className="text-muted-foreground hover:text-foreground">
                              <Edit size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(shift.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && <ShiftModal title="Add Shift" onClose={() => setShowAddModal(false)} />}
      {editingShift && <ShiftModal title="Edit Shift" onClose={() => setEditingShift(null)} />}
    </div>
  );
}
