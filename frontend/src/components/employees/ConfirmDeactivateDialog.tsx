import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useUpdateEmployee } from '@/hooks/useQueries';
import type { Employee } from '@/backend';

interface Props {
  employee: Employee;
  open: boolean;
  onClose: () => void;
}

export default function ConfirmDeactivateDialog({ employee, open, onClose }: Props) {
  const updateEmployee = useUpdateEmployee();
  const isActivating = !employee.isActive;

  const handleConfirm = async () => {
    try {
      await updateEmployee.mutateAsync({ ...employee, isActive: !employee.isActive });
      toast.success(`Employee ${isActivating ? 'reactivated' : 'deactivated'} successfully.`);
      onClose();
    } catch (err) {
      toast.error('Failed to update employee status.');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            {isActivating ? 'Reactivate Employee' : 'Deactivate Employee'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActivating
              ? `Are you sure you want to reactivate ${employee.fullName}? They will regain active status.`
              : `Are you sure you want to deactivate ${employee.fullName}? They will be marked as inactive but their records will be preserved.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={isActivating ? 'bg-teal hover:bg-teal-dark text-white' : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'}
            disabled={updateEmployee.isPending}
          >
            {updateEmployee.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isActivating ? 'Reactivate' : 'Deactivate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
