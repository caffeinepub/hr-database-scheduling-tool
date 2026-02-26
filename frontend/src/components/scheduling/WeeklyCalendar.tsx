import { isSameDay } from '@/lib/utils';
import ShiftCard from './ShiftCard';
import type { Shift, Employee } from '@/backend';

interface Props {
  weekDates: Date[];
  shifts: Shift[];
  employees: Employee[];
  onEditShift: (shift: Shift) => void;
  onViewShift: (shift: Shift) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyCalendar({ weekDates, shifts, employees, onEditShift, onViewShift }: Props) {
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2 min-h-[500px]">
      {weekDates.map((date, idx) => {
        const dayShifts = shifts
          .filter((s) => isSameDay(new Date(Number(s.date) / 1_000_000), date))
          .sort((a, b) => Number(a.startTime) - Number(b.startTime));
        const isToday = isSameDay(date, today);
        const isWeekend = idx >= 5;

        return (
          <div
            key={date.toISOString()}
            className={`rounded-xl border flex flex-col min-h-[500px] ${isToday ? 'border-teal bg-teal-light/20' : isWeekend ? 'border-border bg-muted/30' : 'border-border bg-card'}`}
          >
            {/* Day Header */}
            <div className={`px-3 py-2.5 border-b ${isToday ? 'border-teal/30' : 'border-border'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${isWeekend ? 'text-muted-foreground' : 'text-foreground/60'}`}>
                {DAY_NAMES[idx]}
              </p>
              <p className={`text-lg font-display font-bold leading-tight ${isToday ? 'text-teal' : 'text-foreground'}`}>
                {date.getDate()}
              </p>
              <p className="text-xs text-muted-foreground">
                {date.toLocaleDateString('en-GB', { month: 'short' })}
              </p>
            </div>

            {/* Shifts */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {dayShifts.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 text-center pt-4">No shifts</p>
              ) : (
                dayShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    employees={employees}
                    onEdit={onEditShift}
                    onView={onViewShift}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
