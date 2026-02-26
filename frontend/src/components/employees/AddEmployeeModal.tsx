import { useState } from 'react';
import { useAddEmployee, useIsCallerAdmin } from '../../hooks/useQueries';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { generateId, dateToNanoseconds } from '../../lib/utils';
import { EmployeeRole } from '../../backend';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
}

export default function AddEmployeeModal({ onClose }: Props) {
  const addEmployee = useAddEmployee();
  const { data: isAdmin } = useIsCallerAdmin();

  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [accountLevel, setAccountLevel] = useState<EmployeeRole>(EmployeeRole.employee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEmployee.mutateAsync({
        id: generateId(),
        fullName,
        jobTitle,
        department,
        email,
        phone,
        startDate: dateToNanoseconds(new Date(startDate)),
        isActive,
        role: accountLevel,
        accountLevel,
      });
      toast.success('Employee added successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add employee');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
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
            <Button type="submit" disabled={addEmployee.isPending}>
              {addEmployee.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
