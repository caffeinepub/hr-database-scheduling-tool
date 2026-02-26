import { useState } from 'react';
import { useUpdateEmployee, useIsCallerAdmin } from '../../hooks/useQueries';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { EmployeeRole } from '../../backend';
import type { Employee } from '../../backend';
import { nanosecondsToDate } from '../../lib/utils';
import { toast } from 'sonner';

interface Props {
  employee: Employee;
  onClose: () => void;
}

export default function EditEmployeeModal({ employee, onClose }: Props) {
  const updateEmployee = useUpdateEmployee();
  const { data: isAdmin } = useIsCallerAdmin();

  const [fullName, setFullName] = useState(employee.fullName);
  const [jobTitle, setJobTitle] = useState(employee.jobTitle);
  const [department, setDepartment] = useState(employee.department);
  const [email, setEmail] = useState(employee.email);
  const [phone, setPhone] = useState(employee.phone);
  const [startDate, setStartDate] = useState(
    nanosecondsToDate(employee.startDate).toISOString().split('T')[0]
  );
  const [isActive, setIsActive] = useState(employee.isActive);
  const [accountLevel, setAccountLevel] = useState<EmployeeRole>(employee.accountLevel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployee.mutateAsync({
        ...employee,
        fullName,
        jobTitle,
        department,
        email,
        phone,
        startDate: BigInt(new Date(startDate).getTime()) * BigInt(1_000_000),
        isActive,
        role: accountLevel,
        accountLevel,
      });
      toast.success('Employee updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update employee');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          {isAdmin && (
            <div className="space-y-2">
              <Label>Account Level</Label>
              <Select value={accountLevel} onValueChange={(v) => setAccountLevel(v as EmployeeRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmployeeRole.employee}>Employee</SelectItem>
                  <SelectItem value={EmployeeRole.manager}>Manager</SelectItem>
                  <SelectItem value={EmployeeRole.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="isActive" />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateEmployee.isPending}>
              {updateEmployee.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
