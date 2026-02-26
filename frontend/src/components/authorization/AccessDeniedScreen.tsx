import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShieldX } from 'lucide-react';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldX className="w-10 h-10 text-destructive" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to access this page. Please contact your administrator if you
          believe this is an error.
        </p>
      </div>
      <Button onClick={() => navigate({ to: '/employee-portal' })}>
        Return to Employee Portal
      </Button>
    </div>
  );
}
