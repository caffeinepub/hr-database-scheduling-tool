import { Clock, Users, Pencil, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import type { Shift, Employee } from '@/backend';

interface Props {
  shift: Shift;
  employees: Employee[];
  onEdit: (shift: Shift) => void;
  onView: (shift: Shift) => void;
}

const DEPT_COLORS: Record<string, string> = {
  default: 'bg-teal-light text-teal-dark border-teal/20',
};

function getDeptColor(dept: string): string {
  const colors = [
    'bg-teal-light text-teal-dark border-teal/20',
    'bg-info-bg text-info border-info/20',
    'bg-success-bg text-success border-success/20',
    'bg-warning-bg text-warning border-warning/20',
  ];
  let hash = 0;
  for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ShiftCard({ shift, employees, onEdit, onView }: Props) {
  const assignedEmployees = employees.filter((e) => shift.assignedEmployees.includes(e.id));
  const colorClass = getDeptColor(shift.department);

  return (
    <div className={`rounded-lg border p-2 text-xs ${colorClass} group relative`}>
      {/* Department */}
      <p className="font-semibold text-xs mb-1 truncate">{shift.department}</p>

      {/* Time */}
      <div className="flex items-center gap-1 mb-1.5 opacity-80">
        <Clock size={10} />
        <span>{formatTime(shift.startTime)}–{formatTime(shift.endTime)}</span>
      </div>

      {/* Employees */}
      {assignedEmployees.length > 0 && (
        <div className="flex items-start gap-1 mb-1.5">
          <Users size={10} className="mt-0.5 flex-shrink-0 opacity-70" />
          <div className="flex flex-col gap-0.5">
            {assignedEmployees.slice(0, 2).map((e) => (
              <span key={e.id} className="truncate leading-tight">{e.fullName.split(' ')[0]}</span>
            ))}
            {assignedEmployees.length > 2 && (
              <span className="opacity-60">+{assignedEmployees.length - 2} more</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-black/10"
          onClick={() => onView(shift)}
          title="View Details & Notes"
        >
          <FileText size={11} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-black/10"
          onClick={() => onEdit(shift)}
          title="Edit Shift"
        >
          <Pencil size={11} />
        </Button>
      </div>
    </div>
  );
}
