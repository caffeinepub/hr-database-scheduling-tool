import { useNavigate } from '@tanstack/react-router';
import { Eye, Pencil, UserX, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import type { Employee } from '@/backend';

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function EmployeeTable({ employees, onEdit, onDeactivate }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground/70 w-[280px]">Employee</TableHead>
            <TableHead className="font-semibold text-foreground/70">Job Title</TableHead>
            <TableHead className="font-semibold text-foreground/70">Department</TableHead>
            <TableHead className="font-semibold text-foreground/70">Start Date</TableHead>
            <TableHead className="font-semibold text-foreground/70">Status</TableHead>
            <TableHead className="font-semibold text-foreground/70 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-light flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-teal-dark">{getInitials(emp.fullName)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{emp.fullName}</p>
                    <p className="text-xs text-muted-foreground">{emp.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-foreground/80">{emp.jobTitle}</TableCell>
              <TableCell>
                <span className="text-sm bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium">
                  {emp.department}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(emp.startDate)}</TableCell>
              <TableCell>
                {emp.isActive ? (
                  <Badge className="bg-success-bg text-success border-0 font-medium">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground font-medium">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-teal"
                    onClick={() => navigate({ to: '/employees/$employeeId', params: { employeeId: emp.id } })}
                    title="View Profile"
                  >
                    <Eye size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(emp)}
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${emp.isActive ? 'text-muted-foreground hover:text-destructive' : 'text-muted-foreground hover:text-success'}`}
                    onClick={() => onDeactivate(emp)}
                    title={emp.isActive ? 'Deactivate' : 'Reactivate'}
                  >
                    {emp.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
