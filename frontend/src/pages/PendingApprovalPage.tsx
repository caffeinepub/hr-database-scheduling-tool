import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";

export default function PendingApprovalPage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-6">
            Your account has been created and is awaiting approval from an administrator. You'll be able to access the system once your account has been reviewed.
          </p>
          <div className="bg-secondary rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">What happens next?</strong>
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>An admin will review your account request</li>
              <li>You'll be assigned an appropriate role</li>
              <li>Once approved, you can access the dashboard</li>
            </ul>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
